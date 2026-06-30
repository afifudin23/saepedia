#!/usr/bin/env node
// Release Manager — SEAPEDIA Web
//
//   node scripts/release.js            # menu interaktif
//   node scripts/release.js status     # cek status + tag
//   node scripts/release.js release    # langsung ke alur release
//   node scripts/release.js tags       # lihat semua tag
//   node scripts/release.js delete     # hapus tag
//
// Versi diambil dari "version" di package.json. CHANGELOG.md harus sudah punya
// entry "## [X.Y.Z]" untuk versi target sebelum release.
import { execSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import readline from "node:readline";

// ── Config ────────────────────────────────────────────────────
const projectName = "SEAPEDIA Web";
const prodBranch = "main";
const devBranch = "dev";
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = join(projectRoot, "package.json");
const changelogPath = join(projectRoot, "CHANGELOG.md");

// ── ANSI Colors ───────────────────────────────────────────────
const GR = "\x1b[92m", YL = "\x1b[93m", CY = "\x1b[96m", RD = "\x1b[91m";
const MG = "\x1b[95m", WH = "\x1b[97m", DM = "\x1b[2m", BD = "\x1b[1m", RS = "\x1b[0m";

// ── Shell helpers ─────────────────────────────────────────────
function run(cmd) {
  try {
    return execSync(cmd, { cwd: projectRoot, stdio: ["pipe", "pipe", "pipe"] })
      .toString()
      .trim();
  } catch {
    return "";
  }
}
function runShow(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: projectRoot, stdio: "inherit", shell: false });
  return r.status ?? 1;
}
function sep(c = DM) { console.log(c + "─".repeat(60) + RS); }
function clearScreen() { process.stdout.write("\x1b[2J\x1b[H"); }

// ── Interactive input ─────────────────────────────────────────
function arrowUI(title, options, defaultSel = 0) {
  return new Promise((resolve) => {
    let sel = defaultSel;
    const n = options.length;
    const draw = () => {
      for (let i = 0; i < n; i++) {
        if (i === sel) console.log(`  ${GR}${BD}❯ ${options[i]}${RS}`);
        else console.log(`  ${DM}  ${options[i]}${RS}`);
      }
    };
    console.log(`\n  ${BD}${title}${RS}`);
    draw();

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);

    const onKey = (_str, key) => {
      if (!key) return;
      if (key.ctrl && key.name === "c") {
        cleanup();
        console.log(`\n${RD}❌ Dibatalkan.${RS}\n`);
        process.exit(0);
      }
      if (key.name === "up") sel = (sel - 1 + n) % n;
      else if (key.name === "down") sel = (sel + 1) % n;
      else if (key.name === "return" || key.name === "enter") {
        cleanup();
        process.stdout.write(`\x1b[${n}A`);
        for (let i = 0; i < n; i++) process.stdout.write("\r\x1b[2K\n");
        process.stdout.write(`\x1b[${n}A`);
        console.log(`  ${GR}${BD}❯ ${options[sel]}${RS}`);
        resolve(sel);
        return;
      } else return;
      process.stdout.write(`\x1b[${n}A`);
      draw();
    };
    function cleanup() {
      process.stdin.removeListener("keypress", onKey);
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.stdin.pause();
    }
    process.stdin.resume();
    process.stdin.on("keypress", onKey);
  });
}
const confirm = (q, defYes = true) =>
  arrowUI(q, [GR + "Ya" + RS, RD + "Tidak" + RS], defYes ? 0 : 1).then((i) => i === 0);
const menuSelect = (t, o) => arrowUI(t, o, 0);

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`  ${CY}❯${RS} ${question}`, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

// ── Git info ──────────────────────────────────────────────────
const getCurrentBranch = () => run("git rev-parse --abbrev-ref HEAD") || "-";
function getTagsMatching(pattern) {
  const out = run(`git tag -l "${pattern}" --sort=-v:refname`);
  return out ? out.split("\n").filter(Boolean) : [];
}
const getTagDate = (t) => { const d = run(`git log -1 --format=%ci "${t}"`); return d.length >= 16 ? d.slice(0, 16) : "-"; };
const getTagMessage = (t) => run(`git tag -l -n1 "${t}"`).replace(t, "").trim();
function getLatestTagOnBranch(b) {
  return run(`git describe --tags --abbrev=0 ${b}`) || run(`git describe --tags --abbrev=0 origin/${b}`) || "-";
}
function getLatestCommit(b) {
  const f = (fmt) => run(`git log -1 --format=${fmt} ${b}`) || run(`git log -1 --format=${fmt} origin/${b}`);
  let sha = f("%h") || "-", msg = f("%s") || "-", date = f("%ci") || "-";
  if (msg.length > 60) msg = msg.slice(0, 60);
  if (date.length >= 16) date = date.slice(0, 16);
  return { sha, msg, date };
}

// ── Version (package.json) ────────────────────────────────────
function getVersion() {
  try { return JSON.parse(readFileSync(pkgPath, "utf8")).version || "0.0.0"; }
  catch { return "unknown"; }
}
function setVersion(v) {
  const raw = readFileSync(pkgPath, "utf8");
  // Replace only the top-level "version" field, preserve formatting.
  writeFileSync(pkgPath, raw.replace(/("version"\s*:\s*)"[^"]*"/, `$1"${v}"`));
}
function bumpVersion(version, type) {
  const p = version.split(".").map(Number);
  if (p.length !== 3 || p.some(isNaN)) return version;
  let [maj, min, pat] = p;
  if (type === "major") { maj++; min = 0; pat = 0; }
  else if (type === "minor") { min++; pat = 0; }
  else if (type === "patch") { pat++; }
  return `${maj}.${min}.${pat}`;
}
function getChangelogDescription(version) {
  let content;
  try { content = readFileSync(changelogPath, "utf8"); } catch { return ""; }
  const header = `## [${version}]`;
  const start = content.indexOf(header);
  if (start === -1) return "";
  const rest = content.slice(start);
  const end = rest.indexOf("\n---");
  return (end === -1 ? rest : rest.slice(0, end)).trim();
}

// ── Git commit (multiline via spawn) ──────────────────────────
function gitCommit(subject, body, allowEmpty) {
  const args = ["commit", "-m", subject];
  if (body) args.push("-m", body);
  if (allowEmpty) args.push("--allow-empty");
  spawnSync("git", args, { cwd: projectRoot, stdio: "inherit" });
}

// ── Remote connectivity ───────────────────────────────────────
const getRemoteURL = () => run("git remote get-url origin");
function checkRemoteConnectivity() {
  const url = getRemoteURL();
  if (!url) { console.log(`   ${RD}❌ Remote 'origin' tidak ditemukan.${RS}`); return false; }
  const masked = url.replace(/(https?:\/\/)([^@]+@)/, "$1***@");
  console.log(`   ${DM}🔗 Remote: ${masked}${RS}`);
  console.log(`   ${DM}⏳ Mengecek koneksi ke remote...${RS}`);
  const code = runSilent("git", ["ls-remote", "--exit-code", "--heads", "origin"]);
  if (code === 0) { console.log(`   ${GR}✅ Remote OK.${RS}`); return true; }
  console.log(`   ${RD}❌ Koneksi/akses remote gagal.${RS}`);
  return false;
}
function runSilent(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: projectRoot, stdio: "ignore", env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } });
  return r.status ?? 1;
}

// ── Status & Tags ─────────────────────────────────────────────
function showStatus() {
  console.log(`\n${CY}${BD}🚀  ${projectName} — Status${RS}`);
  sep();
  console.log(`📁  Branch saat ini  : ${CY}${getCurrentBranch()}${RS}`);
  console.log(`📦  Versi            : ${YL}v${getVersion()}${RS}`);
  sep();
  console.log(`\n${BD}📊  Status Per Branch${RS}`);
  sep();
  for (const b of [{ icon: "🔧", branch: devBranch }, { icon: "🟢", branch: prodBranch }]) {
    const tag = getLatestTagOnBranch(b.branch);
    const c = getLatestCommit(b.branch);
    console.log(`${b.icon}  ${BD}${b.branch.padEnd(10)}${RS} → Tag: ${GR}${tag.padEnd(18)}${RS} Commit: ${DM}${c.sha} (${c.date})${RS}`);
    console.log(`              → ${DM}${c.msg}${RS}`);
  }
  sep();
}
function showTags() {
  console.log(`\n${BD}🏷️   Tag Releases${RS}`);
  sep();
  const tags = getTagsMatching("v*");
  if (!tags.length) { console.log(`   ${DM}Belum ada tag.${RS}`); sep(); return; }
  console.log(`   Total: ${YL}${tags.length} tag${RS}\n`);
  for (const t of tags.slice(0, 20))
    console.log(`   ${GR}🟢 ${t.padEnd(22)}${RS} ${DM}${getTagDate(t)}  ${getTagMessage(t)}${RS}`);
  if (tags.length > 20) console.log(`\n   ${DM}... dan ${tags.length - 20} tag lainnya${RS}`);
  sep();
}

// ── Release ───────────────────────────────────────────────────
async function release() {
  console.log(`\n${CY}${BD}🚀  ${projectName} — Release${RS}`);
  sep();
  console.log(`${DM}⏳ Fetching dari remote...${RS}`);
  run("git fetch --all --tags --force");

  const currentVersion = getVersion();
  const currentBranch = getCurrentBranch();
  console.log(`\n📁  Branch  : ${CY}${currentBranch}${RS}`);
  console.log(`📦  Versi   : ${YL}v${currentVersion}${RS}`);
  sep();
  console.log(`  ${BD}📋  Rules:${RS}`);
  console.log(`  ${WH}• Release penuh wajib di branch '${devBranch}'${RS}`);
  console.log(`  ${WH}• CHANGELOG.md harus punya entry versi target sebelum release${RS}`);
  console.log(`  ${WH}• Tag versi tidak boleh sudah ada sebelumnya${RS}`);

  const bumpOpts = [
    `current →  ${CY}v${currentVersion}${RS}  (Release penuh, tanpa bump)`,
    `patch   →  ${WH}v${bumpVersion(currentVersion, "patch")}${RS}`,
    `minor   →  ${YL}v${bumpVersion(currentVersion, "minor")}${RS}`,
    `major   →  ${MG}v${bumpVersion(currentVersion, "major")}${RS}`,
    `custom  →  ${DM}masukkan versi manual${RS}`,
    `${DM}↩️   Kembali ke menu utama${RS}`,
  ];
  const bumpIdx = await menuSelect("Pilih tipe bump:", bumpOpts);
  if (bumpIdx === 5) return;

  let newVersion;
  if (bumpIdx === 0) newVersion = currentVersion;
  else if (bumpIdx === 1) newVersion = bumpVersion(currentVersion, "patch");
  else if (bumpIdx === 2) newVersion = bumpVersion(currentVersion, "minor");
  else if (bumpIdx === 3) newVersion = bumpVersion(currentVersion, "major");
  else {
    newVersion = await ask("Masukkan versi baru (contoh: 1.0.0): ");
    if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
      console.log(`${RD}❌ Format versi tidak valid. Gunakan X.Y.Z${RS}`);
      return;
    }
  }

  const changelogDesc = getChangelogDescription(newVersion);
  if (!changelogDesc) {
    console.log(`\n${RD}❌ CHANGELOG.md belum diupdate untuk v${newVersion}!${RS}`);
    console.log(`${YL}Tambahkan entry ## [${newVersion}] di CHANGELOG.md dulu, lalu jalankan ulang.${RS}`);
    return;
  }

  let isBumpOnly = false;
  if (bumpIdx === 0) {
    if (currentBranch !== devBranch) { console.log(`${YL}⚠️  Release penuh hanya di branch '${devBranch}'.${RS}`); return; }
  } else {
    const modeIdx = await menuSelect("Pilih mode:", [
      `${CY}Hanya bump${RS}  →  commit + push`,
      `${GR}Release penuh${RS}  →  commit + tag + push`,
      `${DM}↩️   Kembali ke menu utama${RS}`,
    ]);
    if (modeIdx === 2) return;
    isBumpOnly = modeIdx === 0;
    if (!isBumpOnly && currentBranch !== devBranch) {
      console.log(`${YL}⚠️  Release penuh hanya di branch '${devBranch}'.${RS}`); return;
    }
  }

  // Sync check
  console.log(`${DM}⏳ Cek sinkronisasi dengan origin/${currentBranch}...${RS}`);
  run("git fetch origin");
  const behind = parseInt(run(`git rev-list --count HEAD..origin/${currentBranch}`) || "0", 10);
  if (behind > 0) {
    console.log(`   ${YL}⚠️  Tertinggal ${behind} commit — menjalankan rebase...${RS}`);
    if (runSilent("git", ["rebase", `origin/${currentBranch}`]) !== 0) {
      run("git rebase --abort");
      console.log(`${RD}${BD}❌  Rebase conflict! Selesaikan dulu.${RS}`);
      return;
    }
    console.log(`   ${GR}✅ Rebase berhasil.${RS}`);
  } else console.log(`   ${GR}✅ Sudah up-to-date.${RS}`);

  if (!checkRemoteConnectivity()) return;

  const confirmText =
    bumpIdx === 0
      ? `🚀  Lanjut Release penuh v${currentVersion} (tetap versi sekarang)?`
      : `🚀  Lanjut ${isBumpOnly ? "Hanya bump" : "Release penuh"} (v${currentVersion} → v${newVersion})?`;
  if (!(await confirm(confirmText, true))) { console.log(`${RD}❌ Dibatalkan.${RS}`); return; }

  // ── BUMP ONLY ───────────────────────────────────────────────
  if (isBumpOnly) {
    if (newVersion !== currentVersion) { setVersion(newVersion); console.log(`   ${GR}✅ v${currentVersion} → v${newVersion}${RS}`); }
    run("git add -A");
    if (run("git status --porcelain")) gitCommit(`chore(bump): v${newVersion}`, changelogDesc, false);
    const ok = runShow("git", ["push", "origin", currentBranch]) === 0;
    sep();
    console.log(`🆕  Versi baru  : ${GR}${BD}v${newVersion}${RS}   🌿 ${CY}${currentBranch}${RS}`);
    console.log(ok ? `${GR}${BD}✅  Bump selesai!${RS}` : `${YL}${BD}⚠️  Bump selesai (push gagal — push manual).${RS}`);
    sep();
    process.exit(0);
  }

  // ── RELEASE PENUH ───────────────────────────────────────────
  const releaseTag = `v${newVersion}`;
  if (getTagsMatching(releaseTag).length) {
    console.log(`\n${RD}❌ Tag ${releaseTag} sudah ada! Pilih versi lain.${RS}`);
    return;
  }
  let committed = false;
  const rollback = (reason) => {
    console.log(`\n   ${RD}❌ ${reason}${RS}`);
    setVersion(currentVersion);
    if (committed) run("git reset HEAD~1");
    console.log(`   ${YL}↩️  Reverted ke v${currentVersion}.${RS}`);
  };

  console.log(`\n${BD}[1/4] Updating version...${RS}`);
  setVersion(newVersion);
  console.log(`   ${GR}✅ v${currentVersion} → v${newVersion}${RS}`);

  console.log(`\n${BD}[2/4] Committing...${RS}`);
  run("git add -A");
  gitCommit(`chore(release): v${newVersion}`, changelogDesc, true);
  committed = true;
  console.log(`   ${GR}✅ Committed.${RS}`);

  console.log(`\n${BD}[3/4] Creating tag...${RS}`);
  spawnSync("git", ["tag", "-a", releaseTag, "-m", `Release v${newVersion}`], { cwd: projectRoot, stdio: "ignore" });
  console.log(`   ${GR}✅ Tag ${releaseTag} dibuat.${RS}`);

  console.log(`\n${BD}[4/4] Pushing ke remote...${RS}`);
  const pushBranch = runShow("git", ["push", "origin", currentBranch]) === 0;
  const pushTag = runShow("git", ["push", "origin", releaseTag]) === 0;
  if (!(pushBranch && pushTag)) { rollback("Push gagal!"); return; }

  sep();
  console.log(`🆕  Versi baru  : ${GR}${BD}v${newVersion}${RS}`);
  console.log(`🌿  Branch      : ${CY}${currentBranch}${RS}   🏷️  ${YL}${releaseTag}${RS}`);
  console.log(`${GR}${BD}✅  Release selesai!${RS}`);
  sep();
  process.exit(0);
}

// ── Delete Tag ────────────────────────────────────────────────
async function deleteTag() {
  console.log(`\n${RD}${BD}🗑️   HAPUS TAG${RS}`);
  sep();
  run("git fetch --tags --force");
  const tags = getTagsMatching("v*");
  if (!tags.length) { console.log(`   ${DM}Tidak ada tag.${RS}`); return; }
  tags.forEach((t, i) => console.log(`   ${DM}${String(i + 1).padStart(3)}.${RS} ${GR}🟢 ${t.padEnd(22)}${RS} ${DM}${getTagDate(t)}${RS}`));
  console.log(`\n   ${DM}💡 Ketik nomor (pisah koma untuk beberapa). Contoh: 1,2,3${RS}\n`);
  const input = await ask("🗑️  Pilih tag (nomor/batal): ");
  if (!input || ["batal", "cancel"].includes(input.toLowerCase())) { console.log(`${RD}❌ Dibatalkan.${RS}`); return; }
  const toDelete = [];
  for (const part of input.split(",")) {
    const n = parseInt(part.trim(), 10);
    if (isNaN(n) || n < 1 || n > tags.length) { console.log(`${YL}⚠️  Nomor ${part} tidak valid.${RS}`); return; }
    toDelete.push(tags[n - 1]);
  }
  const scopeIdx = await menuSelect("Hapus dari mana?", [
    CY + "Lokal saja" + RS, YL + "Remote saja" + RS, RD + "Keduanya" + RS, DM + "↩️   Batal" + RS,
  ]);
  if (scopeIdx === 3) return;
  if (!(await confirm(`🗑️  Hapus ${toDelete.length} tag?`, false))) { console.log(`${RD}❌ Dibatalkan.${RS}`); return; }
  for (const t of toDelete) {
    if (scopeIdx === 1 || scopeIdx === 2) { run(`git push origin --delete ${t}`); console.log(`   ${GR}✅ Remote: ${t}${RS}`); }
    if (scopeIdx === 0 || scopeIdx === 2) { run(`git tag -d ${t}`); console.log(`   ${GR}✅ Lokal: ${t}${RS}`); }
  }
  console.log(`${GR}${BD}✅  Selesai.${RS}`);
}

// ── Menu ──────────────────────────────────────────────────────
async function showMenu() {
  for (;;) {
    clearScreen();
    console.log(`\n${CY}${BD}🚀  ${projectName} — Release Manager${RS}`);
    sep();
    console.log(`   Branch : ${CY}${getCurrentBranch()}${RS}   Versi : ${YL}v${getVersion()}${RS}`);
    sep();
    const choice = await menuSelect("Pilih aksi:", [
      CY + "📊  Cek status" + RS,
      GR + "🆕  Release (bump + commit + push, tag opsional)" + RS,
      YL + "🏷️   Lihat semua tag" + RS,
      DM + "🗑️   Hapus tag" + RS,
      RD + "❌  Keluar" + RS,
    ]);
    if (choice === 4) { console.log(`\n${GR}👋 Bye!${RS}\n`); break; }
    if (choice === 0) { run("git fetch --tags --force"); showStatus(); showTags(); await ask("Tekan Enter untuk kembali..."); }
    else if (choice === 1) await release();
    else if (choice === 2) { run("git fetch --tags --force"); showTags(); await ask("Tekan Enter untuk kembali..."); }
    else if (choice === 3) await deleteTag();
  }
  process.exit(0);
}

// ── Entry ─────────────────────────────────────────────────────
async function main() {
  if (run("git rev-parse --is-inside-work-tree") !== "true") {
    console.log(`${RD}❌ Folder ini belum berupa git repository.${RS}`);
    console.log(`${YL}Jalankan: git init && git remote add origin <url>${RS}`);
    process.exit(1);
  }
  const arg = process.argv[2] || "menu";
  if (arg === "status") { run("git fetch --tags --force"); showStatus(); showTags(); process.exit(0); }
  else if (arg === "release") { await release(); process.exit(0); }
  else if (arg === "tags") { run("git fetch --tags --force"); showTags(); process.exit(0); }
  else if (arg === "delete" || arg === "delete-tag") { await deleteTag(); process.exit(0); }
  else await showMenu();
}

main();
