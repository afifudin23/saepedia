// Input validation helpers (Level 7).
// Used by forms before submitting, and mirrored by the mock API. The real
// backend must re-validate everything server-side (never trust the client).

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^[0-9+\-\s]{8,15}$/;

export function isEmail(v) {
  return EMAIL_RE.test(String(v || "").trim());
}
export function isPhone(v) {
  return PHONE_RE.test(String(v || "").trim());
}
export function required(v) {
  return String(v ?? "").trim().length > 0;
}
export function inRange(v, min, max) {
  const n = Number(v);
  return !Number.isNaN(n) && n >= min && n <= max;
}
export function isPositive(v) {
  return Number(v) > 0;
}
export function nonNegative(v) {
  const n = Number(v);
  return !Number.isNaN(n) && n >= 0;
}

// Defense-in-depth text cleanup for user-generated content.
// React already escapes interpolated text (so <script> cannot execute), but we
// also trim and cap length to keep the layout from breaking.
export function sanitizeText(v, max = 500) {
  return String(v ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

// Validate a whole object against a rules map. Returns { ok, errors }.
// rules: { field: [ [testFn, message], ... ] }
export function validateForm(values, rules) {
  const errors = {};
  for (const field in rules) {
    for (const [test, message] of rules[field]) {
      if (!test(values[field])) {
        errors[field] = message;
        break;
      }
    }
  }
  return { ok: Object.keys(errors).length === 0, errors };
}
