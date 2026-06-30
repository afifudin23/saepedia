import { useEffect, useState } from "react";
import { walletApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import DashboardShell from "../../components/DashboardShell";
import { BUYER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { formatIDR, formatDate } from "../../lib/format";

const PRESETS = [50000, 100000, 250000, 500000];

export default function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");

  function load() {
    walletApi.get(user.id).then(setWallet);
  }
  useEffect(load, [user.id]);

  async function topup(value) {
    setMsg("");
    try {
      const w = await walletApi.topup(user.id, value);
      setWallet(w);
      setAmount("");
      setMsg(`Top-up ${formatIDR(value)} berhasil.`);
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <DashboardShell title="Dompet" subtitle="Saldo dan riwayat transaksi." links={BUYER_LINKS}>
      <Card>
        <div className="label muted">Saldo Saat Ini</div>
        <div className="value bold" style={{ fontSize: "2rem", color: "var(--color-primary-dark)" }}>
          {formatIDR(wallet.balance)}
        </div>
      </Card>

      <Card title="Top-up Saldo (simulasi)">
        <div className="row wrap mb-2">
          {PRESETS.map((p) => (
            <Button key={p} variant="secondary" size="sm" onClick={() => topup(p)}>
              + {formatIDR(p)}
            </Button>
          ))}
        </div>
        <div className="row">
          <input
            className="input"
            type="number"
            min="1"
            placeholder="Nominal lain…"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ maxWidth: 200 }}
          />
          <Button onClick={() => topup(Number(amount))} disabled={!(Number(amount) > 0)}>
            Top-up
          </Button>
        </div>
        {msg && <div className="alert success mt-2">{msg}</div>}
      </Card>

      <Card title="Riwayat Transaksi" className="full">
        {wallet.transactions.length === 0 ? (
          <div className="empty">Belum ada transaksi.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr><th>Tanggal</th><th>Keterangan</th><th>Tipe</th><th className="text-right">Jumlah</th></tr>
              </thead>
              <tbody>
                {wallet.transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="text-sm">{formatDate(t.createdAt)}</td>
                    <td>{t.note}</td>
                    <td>
                      <span className={`badge ${t.amount >= 0 ? "green" : "gray"}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="text-right bold" style={{ color: t.amount >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                      {t.amount >= 0 ? "+" : "-"} {formatIDR(Math.abs(t.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
