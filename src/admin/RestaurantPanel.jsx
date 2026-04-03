import { useEffect, useState, useMemo } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";

/* ── ORDER STATUS TABS ── */
const ORDER_TABS = [
  { key: "PENDING", label: "New Orders", icon: "🔔", color: "orange" },
  { key: "PAYMENT_PENDING", label: "Awaiting Pay", icon: "💳", color: "blue" },
  { key: "PAID", label: "Paid", icon: "💰", color: "emerald" },
  { key: "PREPARING", label: "Preparing", icon: "👨‍🍳", color: "purple" },
  { key: "SERVED", label: "Served", icon: "🍽️", color: "cyan" },
  { key: "COMPLETED", label: "Done", icon: "🏁", color: "green" },
  { key: "REJECTED", label: "Rejected", icon: "❌", color: "red" },
];

const emptyItem = {
  name: "",
  price: "",
  category: "Main Course",
  type: "veg",
  description: "",
  image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
};

const MENU_API = `${import.meta.env.VITE_API_URL}/admin/menu`;

/* ════════════════════════════════════════════════════ */
export default function RestaurantPanel() {
  const { user } = useAuth();
  const restaurantId = user?.restaurantId || 1;

  const [mainTab, setMainTab] = useState("orders"); // "orders" | "menu"

  /* ─── ORDER STATE ─── */
  const [orders, setOrders] = useState([]);
  const [connected, setConnected] = useState(false);
  const [activeOrderTab, setActiveOrderTab] = useState("PENDING");
  const [toast, setToast] = useState(null);

  /* ─── MENU STATE ─── */
  const [menuItems, setMenuItems] = useState([]);
  const [menuForm, setMenuForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [menuSearch, setMenuSearch] = useState("");
  const [saving, setSaving] = useState(false);

  /* ──────────── ORDERS LOGIC ──────────── */
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/orders/restaurant/${restaurantId}`)
      .then((r) => setOrders(r.data))
      .catch(console.error);
  }, [restaurantId]);

  useEffect(() => {
    const socket = new SockJS(import.meta.env.VITE_WS_URL);
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {};
    stompClient.connect(
      {},
      () => {
        setConnected(true);
        stompClient.subscribe(`/topic/orders/${restaurantId}`, (msg) => {
          const data = JSON.parse(msg.body);
          setOrders((prev) => {
            const idx = prev.findIndex((o) => o.id === data.id);
            if (idx !== -1) {
              const copy = [...prev];
              copy[idx] = data;
              return copy;
            }
            return [data, ...prev];
          });
          if (data.status === "PENDING") {
            setToast(`🔔 New order from Table ${data.tableNumber}!`);
            setTimeout(() => setToast(null), 4000);
          }
        });
      },
      console.error
    );
    return () => {
      if (stompClient.connected) stompClient.disconnect();
    };
  }, [restaurantId]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/orders/${id}/status`, { status });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = useMemo(
    () => orders.filter((o) => o.status === activeOrderTab),
    [orders, activeOrderTab]
  );

  const orderCounts = useMemo(() => {
    const c = {};
    ORDER_TABS.forEach((t) => (c[t.key] = 0));
    orders.forEach((o) => {
      if (c[o.status] !== undefined) c[o.status]++;
    });
    return c;
  }, [orders]);

  /* ──────────── MENU LOGIC ──────────── */
  useEffect(() => {
    axios
      .get(`${MENU_API}/${restaurantId}`)
      .then((r) => setMenuItems(r.data))
      .catch(console.error);
  }, [restaurantId]);

  const filteredMenu = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    if (!q) return menuItems;
    return menuItems.filter((x) =>
      `${x.name} ${x.category} ${x.type}`.toLowerCase().includes(q)
    );
  }, [menuItems, menuSearch]);

  const onMenuChange = (k, v) => setMenuForm((p) => ({ ...p, [k]: v }));

  const resetMenu = () => {
    setMenuForm(emptyItem);
    setEditingId(null);
  };

  const submitMenu = async (e) => {
    e.preventDefault();
    if (!menuForm.name.trim()) return alert("Name required");
    setSaving(true);
    try {
      const payload = {
        name: menuForm.name.trim(),
        price: Number(menuForm.price || 0),
        category: menuForm.category.trim(),
        type: menuForm.type,
        description: menuForm.description.trim(),
        image: menuForm.image.trim(),
      };
      if (editingId) {
        const r = await axios.put(`${MENU_API}/item/${editingId}`, payload);
        setMenuItems((p) => p.map((i) => (i.id === editingId ? r.data : i)));
      } else {
        const r = await axios.post(`${MENU_API}/${restaurantId}`, payload);
        setMenuItems((p) => [...p, r.data]);
      }
      resetMenu();
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setMenuForm({
      name: item.name || "",
      price: String(item.price ?? ""),
      category: item.category || "Main Course",
      type: item.type || "veg",
      description: item.description || "",
      image: item.image || emptyItem.image,
    });
  };

  const deleteItem = async (id) => {
    if (!confirm("Delete this item?")) return;
    await axios.delete(`${MENU_API}/item/${id}`);
    setMenuItems((p) => p.filter((i) => i.id !== id));
  };

  const toggleAvailability = async (item) => {
    try {
      const r = await axios.put(`${MENU_API}/item/${item.id}`, {
        ...item,
        available: !item.available,
      });
      setMenuItems((p) => p.map((i) => (i.id === item.id ? r.data : i)));
    } catch (err) {
      console.error(err);
    }
  };

  /* ──────────── HELPERS ──────────── */
  const statusColor = (s) => {
    const m = {
      PENDING: "text-orange-400 bg-orange-400/10 border-orange-400/20",
      PAYMENT_PENDING: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      PAID: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      PREPARING: "text-purple-400 bg-purple-400/10 border-purple-400/20",
      SERVED: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
      COMPLETED: "text-green-400 bg-green-400/10 border-green-400/20",
      REJECTED: "text-red-400 bg-red-400/10 border-red-400/20",
    };
    return m[s] || "text-gray-400 bg-gray-400/10";
  };

  const tabColor = (c, active) => {
    if (!active) return "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10";
    const m = {
      orange: "bg-orange-500/20 border-orange-500/40 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.15)]",
      blue: "bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.15)]",
      emerald: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
      purple: "bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]",
      cyan: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]",
      green: "bg-green-500/20 border-green-500/40 text-green-300 shadow-[0_0_12px_rgba(34,197,94,0.15)]",
      red: "bg-red-500/20 border-red-500/40 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.15)]",
    };
    return m[c] || "";
  };

  const fmtTime = (d) =>
    d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";

  /* ════════════ RENDER ════════════ */
  return (
    <div className="space-y-5">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 right-4 z-[100] px-5 py-3 rounded-2xl bg-orange-500/90 text-black font-extrabold text-sm shadow-[0_0_30px_rgba(249,115,22,0.4)] backdrop-blur-xl border border-orange-400/50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tab Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex rounded-xl overflow-hidden border border-white/10">
          <button
            onClick={() => setMainTab("orders")}
            className={`px-6 py-3 font-extrabold text-sm transition ${
              mainTab === "orders"
                ? "bg-orange-500/20 text-orange-300"
                : "bg-white/5 text-gray-500 hover:text-gray-300"
            }`}
          >
            📦 Orders
            {orderCounts.PENDING > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-orange-500 text-black text-[10px] font-bold">
                {orderCounts.PENDING}
              </span>
            )}
          </button>
          <button
            onClick={() => setMainTab("menu")}
            className={`px-6 py-3 font-extrabold text-sm transition ${
              mainTab === "menu"
                ? "bg-cyan-500/20 text-cyan-300"
                : "bg-white/5 text-gray-500 hover:text-gray-300"
            }`}
          >
            🍽️ Menu
            <span className="ml-2 text-[10px] text-gray-500">{menuItems.length}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          {mainTab === "orders" && (
            <>
              {connected ? (
                <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
              {connected ? "Live" : "Connecting..."}
              <span className="ml-2">{orders.length} orders</span>
            </>
          )}
        </div>
      </div>

      {/* ═══════════ ORDERS TAB ═══════════ */}
      {mainTab === "orders" && (
        <div className="space-y-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {ORDER_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveOrderTab(t.key)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${tabColor(
                  t.color,
                  activeOrderTab === t.key
                )}`}
              >
                <span>{t.icon}</span>
                {t.label}
                {orderCounts[t.key] > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] min-w-[20px] text-center">
                    {orderCounts[t.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Order Cards */}
          <div className="grid gap-4 lg:grid-cols-2 items-start">
            <AnimatePresence mode="popLayout">
              {filteredOrders.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel p-10 text-center col-span-full border border-glass-border"
                >
                  <p className="text-4xl">
                    {ORDER_TABS.find((t) => t.key === activeOrderTab)?.icon || "📋"}
                  </p>
                  <h3 className="text-lg font-bold mt-3">
                    No {activeOrderTab.toLowerCase().replace("_", " ")} orders
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Orders with this status will appear here.
                  </p>
                </motion.div>
              ) : (
                filteredOrders.map((order) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={order.id}
                    className="glass-panel border border-glass-border shadow-glass hover:shadow-neon transition-all relative overflow-hidden group"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${
                        statusColor(order.status).split(" ")[1]
                      }`}
                    />
                    <div className="p-5 pl-4">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-extrabold">
                            Table {order.tableNumber}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                              #{order.id}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {fmtTime(order.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-widest ${statusColor(
                            order.status
                          )}`}
                        >
                          {order.status.replace("_", " ")}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 mb-5">
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm border-b border-white/5 pb-2"
                          >
                            <span className="text-gray-200">
                              <span className="text-amber-400 font-bold mr-1">
                                {item.quantity}×
                              </span>
                              {item.menuItemName}
                            </span>
                            <span className="text-gray-500 tabular-nums">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2">
                          <span className="font-bold text-gray-300 text-sm">Total</span>
                          <span className="text-lg font-extrabold">₹{order.totalAmount}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {order.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => updateStatus(order.id, "PAYMENT_PENDING")}
                              className="px-4 py-2.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 rounded-xl text-[11px] uppercase tracking-wider font-extrabold transition-all hover:scale-[1.02]"
                            >
                              ✅ Accept
                            </button>
                            <button
                              onClick={() => updateStatus(order.id, "REJECTED")}
                              className="px-4 py-2.5 bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 rounded-xl text-[11px] uppercase tracking-wider font-extrabold transition-all hover:scale-[1.02]"
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        {order.status === "PAYMENT_PENDING" && (
                          <span className="px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] uppercase tracking-wider font-extrabold">
                            💳 Waiting for payment...
                          </span>
                        )}
                        {order.status === "PAID" && (
                          <button
                            onClick={() => updateStatus(order.id, "PREPARING")}
                            className="px-4 py-2.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 rounded-xl text-[11px] uppercase tracking-wider font-extrabold transition-all hover:scale-[1.02]"
                          >
                            👨‍🍳 Start Preparing
                          </button>
                        )}
                        {order.status === "PREPARING" && (
                          <button
                            onClick={() => updateStatus(order.id, "SERVED")}
                            className="px-4 py-2.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 rounded-xl text-[11px] uppercase tracking-wider font-extrabold transition-all hover:scale-[1.02]"
                          >
                            🍽️ Mark Served
                          </button>
                        )}
                        {order.status === "SERVED" && (
                          <button
                            onClick={() => updateStatus(order.id, "COMPLETED")}
                            className="px-4 py-2.5 bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 rounded-xl text-[11px] uppercase tracking-wider font-extrabold transition-all hover:scale-[1.02]"
                          >
                            🏁 Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ═══════════ MENU TAB ═══════════ */}
      {mainTab === "menu" && (
        <div className="space-y-5">
          {/* Add/Edit Form */}
          <div className="glass-panel border border-glass-border p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-extrabold">
                {editingId ? "✏️ Edit Item" : "➕ Add Menu Item"}
              </h3>
              {editingId && (
                <button
                  onClick={resetMenu}
                  className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition text-sm"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={submitMenu} className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                  Details
                </p>
                <input
                  value={menuForm.name}
                  onChange={(e) => onMenuChange("name", e.target.value)}
                  placeholder="Item name"
                  className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-orange-500/50 transition text-sm"
                />
                <input
                  value={menuForm.price}
                  onChange={(e) => onMenuChange("price", e.target.value)}
                  placeholder="Price (₹)"
                  type="number"
                  className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-orange-500/50 transition text-sm"
                />
                <input
                  value={menuForm.category}
                  onChange={(e) => onMenuChange("category", e.target.value)}
                  placeholder="Category (Pizza, Drinks, Main Course)"
                  className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-orange-500/50 transition text-sm"
                />
                <select
                  value={menuForm.type}
                  onChange={(e) => onMenuChange("type", e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none text-sm"
                >
                  <option value="veg">🟢 Veg</option>
                  <option value="nonveg">🔴 Non-Veg</option>
                </select>
                <textarea
                  value={menuForm.description}
                  onChange={(e) => onMenuChange("description", e.target.value)}
                  placeholder="Description"
                  className="w-full min-h-[80px] rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none text-sm"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                  Image
                </p>
                <input
                  value={menuForm.image}
                  onChange={(e) => onMenuChange("image", e.target.value)}
                  placeholder="Image URL"
                  className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none text-sm"
                />
                <img
                  src={menuForm.image}
                  alt="preview"
                  className="rounded-xl border border-white/10 h-[180px] w-full object-cover"
                />
              </div>

              <div className="lg:col-span-2">
                <button
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-orange-500 text-black font-extrabold hover:bg-orange-400 transition shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Update Item" : "➕ Add Item"}
                </button>
              </div>
            </form>
          </div>

          {/* Items Grid */}
          <div className="glass-panel border border-glass-border p-6">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
              <h3 className="text-lg font-extrabold">
                Menu Items ({menuItems.length})
              </h3>
              <input
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search menu..."
                className="w-full sm:w-[280px] rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none text-sm"
              />
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredMenu.map((x) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={x.id}
                    className={`rounded-2xl border overflow-hidden hover:border-white/20 transition group ${
                      x.available === false
                        ? "border-red-500/30 bg-red-500/5 opacity-70"
                        : "border-white/10 bg-black/30"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={x.image || emptyItem.image}
                        alt={x.name}
                        className="h-36 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {x.available === false && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="px-3 py-1 rounded-full bg-red-500/80 text-white text-xs font-bold">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold">{x.name}</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            ₹{x.price} • {x.category}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            x.type === "veg"
                              ? "bg-green-500/10 border-green-500/30 text-green-300"
                              : "bg-red-500/10 border-red-500/30 text-red-300"
                          }`}
                        >
                          {x.type}
                        </span>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => toggleAvailability(x)}
                          className={`flex-1 px-3 py-2 rounded-xl border text-xs font-bold transition ${
                            x.available === false
                              ? "bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20"
                              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
                          }`}
                        >
                          {x.available === false ? "✅ Mark Available" : "🚫 Out of Stock"}
                        </button>
                        <button
                          onClick={() => startEdit(x)}
                          className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition text-xs font-bold"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteItem(x.id)}
                          className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition text-xs font-bold"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredMenu.length === 0 && (
                <div className="md:col-span-2 xl:col-span-3 glass-panel border border-glass-border p-10 text-center text-gray-400">
                  <p className="text-3xl mb-3">🍽️</p>
                  No menu items found. Add your first dish above!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
