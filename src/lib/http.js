// ---------------------------------------------------------------------------
// Thin fetch wrapper for the SEAPEDIA Go API.
// Handles base URL, JWT bearer token, and the standard response envelope:
//   success: { status: true, data | list_data, message, pagination? }
//   error:   { status: false, message, error_code, error? }
// On error it throws an Error with `.code` (error_code) and `.status` (HTTP).
// ---------------------------------------------------------------------------

export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const AUTH_KEY = "seapedia_auth";

function token() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY))?.token || null;
  } catch {
    return null;
  }
}

async function request(method, path, body, { auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const tk = auth ? token() : null;
  if (tk) headers["Authorization"] = `Bearer ${tk}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error(
      "Server SEAPEDIA sedang tidak aktif. Coba lagi sebentar ya 🙏"
    );
    err.code = "NETWORK";
    throw err;
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok || (json && json.status === false)) {
    const message =
      (json && (json.message || firstFieldError(json.error))) ||
      `Request gagal (${res.status})`;
    const err = new Error(message);
    err.code = (json && json.error_code) || res.status;
    err.status = res.status;
    err.fieldErrors = json && json.error;
    throw err;
  }

  return json || {};
}

function firstFieldError(errObj) {
  if (errObj && typeof errObj === "object") {
    const first = Object.values(errObj)[0];
    if (typeof first === "string") return first;
  }
  return null;
}

// Return the single object payload.
async function data(method, path, body, opts) {
  const json = await request(method, path, body, opts);
  return json.data;
}
// Return the list payload (list_data) — falls back to data when needed.
async function list(method, path, body, opts) {
  const json = await request(method, path, body, opts);
  return json.list_data ?? json.data ?? [];
}

export const http = {
  get: (p, opts) => data("GET", p, undefined, opts),
  getList: (p, opts) => list("GET", p, undefined, opts),
  post: (p, b, opts) => data("POST", p, b, opts),
  postList: (p, b, opts) => list("POST", p, b, opts),
  put: (p, b, opts) => data("PUT", p, b, opts),
  del: (p, opts) => data("DELETE", p, undefined, opts),
  raw: request,
};
