// ---------------------------------------------------------------------------
// SEAPEDIA API client.
//
// This module talks to the real Go backend (saepedia-api) over HTTP and maps
// its snake_case responses into the camelCase shapes the React UI already
// consumes — so pages/components did not need to change.
//
// Base URL & envelope handling live in ./http.js. Auth token is read from
// localStorage by the http layer.
//
// (The previous localStorage mock `db.js` is no longer used by the app.)
// ---------------------------------------------------------------------------
import { http } from "./http";
import { getDeliveryMethod } from "./format";

const DAY = 24 * 60 * 60 * 1000;

// ----------------------------- mappers ------------------------------------
function mapUser(u) {
  if (!u) return null;
  const email = u.email || "";
  return {
    id: u.id,
    email,
    // Backend identifies users by email (no username column); derive a display
    // name from the email local-part so existing UI (avatar, greeting) works.
    username: u.username || email.split("@")[0] || "user",
    roles: u.roles || [],
    isAdmin: !!u.is_admin,
  };
}

function mapProduct(p) {
  if (!p) return null;
  const store = p.store
    ? { id: p.store.id, name: p.store.name }
    : p.store_id
    ? { id: p.store_id, name: p.store_name || "" }
    : null;
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    image: p.image_url || "",
    emoji: "📦", // fallback when there is no image
    category: p.category || "",
    store,
    storeId: store?.id || p.store_id || null,
  };
}

function mapStore(s) {
  return { id: s.id, name: s.name, description: s.description || "" };
}

function mapReview(r) {
  return {
    id: r.id,
    name: r.reviewer_name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  };
}

function mapAddress(a) {
  return {
    id: a.id,
    label: a.is_primary ? "Alamat Utama" : "Alamat",
    recipient: a.recipient_name,
    phone: a.phone,
    full: a.full_address,
    isDefault: a.is_primary,
  };
}

function mapTxn(t) {
  return {
    id: t.id,
    type: t.type,
    amount: t.amount,
    note: t.description,
    createdAt: t.created_at,
  };
}

function mapCart(c) {
  const items = (c.items || []).map((i) => ({
    productId: i.product_id,
    qty: i.quantity,
    name: i.product_name,
    price: i.price,
    emoji: "📦",
    stock: i.stock,
    storeId: c.store_id,
  }));
  return {
    storeId: c.store_id || null,
    store: c.store_id ? { id: c.store_id, name: c.store_name } : null,
    items,
    subtotal: c.subtotal || 0,
    count: c.item_count || items.reduce((n, i) => n + i.qty, 0),
  };
}

function computeDue(createdAt, method) {
  const sla = getDeliveryMethod(method).slaDays || 1;
  return new Date(Date.parse(createdAt) + sla * DAY).toISOString();
}

function mapOrder(o) {
  return {
    id: o.id,
    storeId: o.store_id,
    storeName: o.store_name,
    buyerUsername: o.buyer_username,
    items: (o.items || []).map((i) => ({
      productId: i.product_id,
      name: i.product_name,
      price: i.price,
      qty: i.quantity,
      emoji: "📦",
    })),
    subtotal: o.subtotal,
    discount: o.discount || 0,
    discountCode: o.discount_code || "",
    deliveryFee: o.delivery_fee,
    deliveryMethod: o.delivery_method,
    deliveryLabel: getDeliveryMethod(o.delivery_method).label,
    ppn: o.tax,
    total: o.total,
    address: {
      label: "",
      recipient: o.recipient_name,
      phone: o.phone,
      full: o.full_address,
    },
    status: o.status,
    statusHistory: (o.status_history || []).map((h) => ({
      status: h.status,
      at: h.created_at,
      note: h.note,
    })),
    createdAt: o.created_at,
    dueAt: computeDue(o.created_at, o.delivery_method),
  };
}

function mapDiscount(d) {
  return {
    id: d.id,
    code: d.code,
    kind: d.kind,
    discountType: d.discount_type,
    value: d.discount_value,
    maxDiscount: d.max_discount,
    minSpend: d.min_spend,
    used: d.used_count || 0,
    maxUsage: d.usage_limit,
    expiry: d.expires_at,
  };
}

function mapJob(j) {
  return {
    id: j.order_id,
    storeName: j.store_name,
    address: { recipient: j.recipient_name, full: j.full_address },
    deliveryLabel: getDeliveryMethod(j.delivery_method).label,
    deliveryFee: j.delivery_fee,
    earning: j.earning,
    status: j.status,
    createdAt: j.created_at,
    items: [],
  };
}

function toRFC3339(dateStr) {
  if (!dateStr) return new Date(Date.now() + 30 * DAY).toISOString();
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return new Date(Date.now() + 30 * DAY).toISOString();
  return d.toISOString();
}

// ----------------------------- AUTH ---------------------------------------
export const authApi = {
  async register({ email, password, roles }) {
    return http.post(
      "/auth/register",
      { email, password, confirm_password: password, roles: roles || ["buyer"] },
      { auth: false }
    );
  },

  async login({ email, password }) {
    const d = await http.post("/auth/login", { email, password }, { auth: false });
    return {
      token: d.token,
      user: mapUser(d.user),
      activeRole: d.active_role || null,
      needRoleSelection: !!d.need_role_selection,
    };
  },

  async me() {
    const d = await http.get("/auth/me");
    return { user: mapUser(d.user), activeRole: d.active_role || null };
  },

  async selectRole(role) {
    const d = await http.post("/auth/select-role", { role });
    return { token: d.token, user: mapUser(d.user), activeRole: d.active_role || null };
  },

  async logout() {
    try {
      await http.post("/auth/logout");
    } catch {
      /* even if it fails, the client clears the session */
    }
  },

  async balanceSummary() {
    return http.get("/auth/balance-summary");
  },
};

// --------------------------- CATALOG --------------------------------------
export const catalogApi = {
  async listProducts({ q = "", storeId = "" } = {}) {
    const params = new URLSearchParams({ per_page: "100" });
    if (q) params.set("search", q);
    const rows = await http.getList(`/products?${params.toString()}`, { auth: false });
    let items = rows.map(mapProduct);
    if (storeId) items = items.filter((p) => p.storeId === storeId);
    return items;
  },
  async getProduct(id) {
    return mapProduct(await http.get(`/products/${id}`, { auth: false }));
  },
  async getStore(id) {
    const store = mapStore(await http.get(`/stores/${id}`, { auth: false }));
    const rows = await http.getList(`/products?per_page=100`, { auth: false });
    store.products = rows.map(mapProduct).filter((p) => p.storeId === id);
    return store;
  },
  async categories() {
    return []; // backend has no product categories
  },
};

// ---------------------------- REVIEWS -------------------------------------
export const reviewApi = {
  async list() {
    const rows = await http.getList("/reviews", { auth: false });
    return rows.map(mapReview);
  },
  async add({ name, rating, comment }) {
    const d = await http.post(
      "/reviews",
      { reviewer_name: name, rating: Number(rating), comment },
      { auth: false }
    );
    return mapReview(d);
  },
};

// ----------------------- SELLER (store + products) ------------------------
export const sellerApi = {
  async myStore() {
    try {
      return mapStore(await http.get("/seller/store"));
    } catch (e) {
      if (e.status === 404 || e.code === "NOT_FOUND") return null;
      throw e;
    }
  },
  async saveStore(_ownerId, { name, description }) {
    return mapStore(await http.put("/seller/store", { name, description }));
  },
  async myProducts() {
    const rows = await http.getList("/seller/products");
    return rows.map(mapProduct);
  },
  async createProduct(_ownerId, data) {
    const body = {
      name: data.name,
      description: data.description || "",
      price: Number(data.price),
      stock: Number(data.stock),
    };
    if (data.image) body.image_url = data.image;
    return mapProduct(await http.post("/seller/products", body));
  },
  async updateProduct(_ownerId, id, data) {
    const body = {
      name: data.name,
      description: data.description || "",
      price: Number(data.price),
      stock: Number(data.stock),
    };
    if (data.image) body.image_url = data.image;
    return mapProduct(await http.put(`/seller/products/${id}`, body));
  },
  async deleteProduct(_ownerId, id) {
    await http.del(`/seller/products/${id}`);
    return { id };
  },
  async incomingOrders() {
    const rows = await http.getList("/seller/orders");
    return rows.map(mapOrder);
  },
  async processOrder(_ownerId, orderId) {
    return mapOrder(await http.post(`/seller/orders/${orderId}/process`));
  },
  async report() {
    const [rep, orders] = await Promise.all([
      http.get("/seller/reports"),
      http.getList("/seller/orders").then((r) => r.map(mapOrder)),
    ]);
    const c = rep.count_by_status || {};
    return {
      totalIncome: rep.total_revenue || 0,
      counts: {
        total: rep.total_orders || 0,
        done: c["Pesanan Selesai"] || 0,
        waiting: c["Menunggu Pengirim"] || 0,
        shipping: c["Sedang Dikirim"] || 0,
        returned: c["Dikembalikan"] || 0,
      },
      orders,
    };
  },
};

// ---------------------------- WALLET --------------------------------------
export const walletApi = {
  async get() {
    const [w, txns] = await Promise.all([
      http.get("/buyer/wallet"),
      http.getList("/buyer/wallet/transactions"),
    ]);
    return { balance: w.balance || 0, transactions: txns.map(mapTxn) };
  },
  async topup(_userId, amount) {
    await http.post("/buyer/wallet/topup", { amount: Number(amount) });
    return walletApi.get();
  },
};

// ---------------------------- ADDRESS -------------------------------------
export const addressApi = {
  async list() {
    const rows = await http.getList("/buyer/addresses");
    return rows.map(mapAddress);
  },
  async add(_userId, data) {
    const current = await http.getList("/buyer/addresses");
    const d = await http.post("/buyer/addresses", {
      recipient_name: data.recipient,
      phone: data.phone || "",
      full_address: data.full,
      is_primary: current.length === 0,
    });
    return mapAddress(d);
  },
  async remove(_userId, id) {
    await http.del(`/buyer/addresses/${id}`);
    return { id };
  },
  async setDefault(_userId, id) {
    const rows = await http.getList("/buyer/addresses");
    const a = rows.find((x) => x.id === id);
    if (a) {
      await http.put(`/buyer/addresses/${id}`, {
        recipient_name: a.recipient_name,
        phone: a.phone,
        full_address: a.full_address,
        is_primary: true,
      });
    }
    return addressApi.list();
  },
};

// ------------------------------ CART --------------------------------------
export const cartApi = {
  async get() {
    return mapCart(await http.get("/buyer/cart"));
  },
  async add(_userId, productId, qty = 1) {
    try {
      await http.post("/buyer/cart/items", { product_id: productId, quantity: qty });
    } catch (e) {
      // Single-store rule -> backend 409 CONFLICT.
      if (e.status === 409 || e.code === "CONFLICT" || /one store/i.test(e.message)) {
        e.code = "DIFFERENT_STORE";
      }
      throw e;
    }
    return cartApi.get();
  },
  async updateQty(_userId, productId, qty) {
    if (Number(qty) < 1) return cartApi.remove(_userId, productId);
    await http.put(`/buyer/cart/items/${productId}`, { quantity: Number(qty) });
    return cartApi.get();
  },
  async remove(_userId, productId) {
    await http.del(`/buyer/cart/items/${productId}`);
    return cartApi.get();
  },
  async clear() {
    await http.del("/buyer/cart");
    return cartApi.get();
  },
};

// ------------------------------ ORDERS ------------------------------------
export const orderApi = {
  async preview(_userId, { deliveryMethod, code = "" }) {
    const s = await http.post("/buyer/checkout/preview", {
      delivery_method: deliveryMethod,
      discount_code: code || "",
    });
    return {
      subtotal: s.subtotal,
      discount: s.discount || 0,
      discountCode: s.discount_code || "",
      discountKind: s.discount_kind || "",
      deliveryFee: s.delivery_fee,
      ppn: s.tax,
      total: s.total,
    };
  },
  async checkout(_userId, { deliveryMethod, addressId, code = "" }) {
    const d = await http.post("/buyer/checkout", {
      address_id: addressId,
      delivery_method: deliveryMethod,
      discount_code: code || "",
    });
    return mapOrder(d);
  },
  async myOrders() {
    const rows = await http.getList("/buyer/orders");
    return rows.map(mapOrder);
  },
  async get(_userId, id) {
    return mapOrder(await http.get(`/buyer/orders/${id}`));
  },
  async report() {
    const [rep, orders] = await Promise.all([
      http.get("/buyer/reports"),
      http.getList("/buyer/orders").then((r) => r.map(mapOrder)),
    ]);
    const c = rep.count_by_status || {};
    return {
      totalSpent: rep.total_spent || 0,
      totalRefunded: rep.total_refunded || 0,
      counts: { total: rep.total_orders || 0, done: c["Pesanan Selesai"] || 0 },
      orders,
    };
  },
};

// ---------------------------- DISCOUNTS -----------------------------------
export const discountApi = {
  async list() {
    const [vouchers, promos] = await Promise.all([
      http.getList("/admin/vouchers"),
      http.getList("/admin/promos"),
    ]);
    return { vouchers: vouchers.map(mapDiscount), promos: promos.map(mapDiscount) };
  },
};

// ------------------------------ DRIVER ------------------------------------
export const driverApi = {
  async availableJobs() {
    const rows = await http.getList("/driver/jobs");
    return rows.map(mapJob);
  },
  async getJob(orderId) {
    return mapJob(await http.get(`/driver/jobs/${orderId}`));
  },
  async takeJob(_driverId, orderId) {
    return http.post(`/driver/jobs/${orderId}/take`);
  },
  async completeJob(_driverId, orderId) {
    return http.post(`/driver/jobs/${orderId}/complete`);
  },
  async myJobs() {
    const d = await http.get("/driver/dashboard");
    return {
      active: (d.active_jobs || []).map(mapJob),
      completed: (d.history || []).map(mapJob),
      totalEarning: d.total_earnings || 0,
    };
  },
};

// ------------------------------- ADMIN ------------------------------------
export const adminApi = {
  async monitoring() {
    const [summary, users, stores, products, orders, deliveries, overdue, vouchers, promos] =
      await Promise.all([
        http.get("/admin/summary").catch(() => ({})),
        http.getList("/admin/users").catch(() => []),
        http.getList("/admin/stores").catch(() => []),
        http.getList("/admin/products").catch(() => []),
        http.getList("/admin/orders").catch(() => []),
        http.getList("/admin/deliveries").catch(() => []),
        http.get("/admin/overdue-orders").catch(() => []),
        http.getList("/admin/vouchers").catch(() => []),
        http.getList("/admin/promos").catch(() => []),
      ]);
    return {
      summary,
      users: users.map((u) => ({ id: u.id, username: u.username, email: u.email, roles: u.roles || [] })),
      stores: stores.map((s) => ({
        id: s.id,
        name: s.name,
        description: `Owner: ${s.owner} · ${s.product_count} produk`,
      })),
      products: products.map((p) => ({ id: p.id, name: p.name, emoji: "📦", price: p.price, stock: p.stock })),
      orders: (orders || []).map((o) => ({ id: o.id, createdAt: o.created_at, total: o.total, status: o.status })),
      deliveries: (deliveries || []).map((d) => ({
        id: d.order_id,
        storeName: d.store_name,
        status: d.status,
        driverId: d.driver_username || "—",
      })),
      overdue: (overdue || []).map((o) => ({
        id: o.id,
        status: o.status,
        dueAt: computeDue(o.created_at, o.delivery_method),
        total: o.total,
      })),
      vouchers: (vouchers || []).map(mapDiscount),
      promos: (promos || []).map(mapDiscount),
    };
  },

  async createVoucher(data) {
    const body = {
      code: data.code,
      discount_type: data.discountType,
      discount_value: Number(data.value),
      min_spend: Number(data.minSpend) || 0,
      expires_at: toRFC3339(data.expiry),
    };
    if (Number(data.maxDiscount) > 0) body.max_discount = Number(data.maxDiscount);
    if (Number(data.maxUsage) > 0) body.usage_limit = Number(data.maxUsage);
    return mapDiscount(await http.post("/admin/vouchers", body));
  },

  async createPromo(data) {
    const body = {
      code: data.code,
      discount_type: data.discountType,
      discount_value: Number(data.value),
      min_spend: Number(data.minSpend) || 0,
      expires_at: toRFC3339(data.expiry),
    };
    if (Number(data.maxDiscount) > 0) body.max_discount = Number(data.maxDiscount);
    return mapDiscount(await http.post("/admin/promos", body));
  },

  async getVoucher(id) {
    return mapDiscount(await http.get(`/admin/vouchers/${id}`));
  },
  async getPromo(id) {
    return mapDiscount(await http.get(`/admin/promos/${id}`));
  },

  async overdueOrders() {
    const rows = await http.get("/admin/overdue-orders");
    return (rows || []).map((o) => ({
      id: o.id,
      status: o.status,
      deliveryLabel: getDeliveryMethod(o.delivery_method).label,
      dueAt: computeDue(o.created_at, o.delivery_method),
      total: o.total,
    }));
  },

  async runOverdueSweep() {
    const d = await http.post("/admin/overdue/run");
    return { scanned: d.processed_count || 0, refunded: d.processed_count || 0 };
  },

  async simulateNextDay(days = 1) {
    const d = await http.post("/admin/simulate/advance-day", { days });
    return { scanned: d.processed_count || 0, refunded: d.processed_count || 0, offsetDays: d.offset_days };
  },

  async clockInfo() {
    const d = await http.get("/admin/simulate/now");
    return { nowIso: d.now, offsetDays: 0 };
  },
};
