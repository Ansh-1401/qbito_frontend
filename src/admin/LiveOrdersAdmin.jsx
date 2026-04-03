import { useEffect, useState, useMemo } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const TABS = [
  { key: "PENDING", label: "New Orders", icon: "🔔", color: "orange" },
  { key: "PAYMENT_PENDING", label: "Awaiting Payment", icon: "💳", color: "blue" },
  { key: "PAID", label: "Paid", icon: "💰", color: "emerald" },
  { key: "PREPARING", label: "Preparing", icon: "👨‍🍳", color: "purple" },
  { key: "SERVED", label: "Served", icon: "🍽️", color: "cyan" },
  { key: "COMPLETED", label: "Completed", icon: "🏁", color: "green" },
  { key: "REJECTED", label: "Rejected", icon: "❌", color: "red" },
];

export default function LiveOrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [toast, setToast] = useState(null);

  const restaurantId = 1;

  // Load existing orders from DB on mount
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/orders/restaurant/${restaurantId}`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Failed to load orders:", err));
  }, []);

  // Connect WebSocket
  useEffect(() => {
    const socket = new SockJS(import.meta.env.VITE_WS_URL);
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    stompClient.connect(
      {},
      () => {
        setConnected(true);

        stompClient.subscribe(`/topic/orders/${restaurantId}`, (message) => {
          const orderData = JSON.parse(message.body);

          setOrders((prev) => {
            const idx = prev.findIndex((o) => o.id === orderData.id);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = orderData;
              return updated;
            }
            return [orderData, ...prev];
          });

          // Show toast for PENDING (new) orders
          if (orderData.status === "PENDING") {
            setToast(`🔔 New order from Table ${orderData.tableNumber}!`);
            setTimeout(() => setToast(null), 4000);
          }
        });
      },
      (error) => {
        console.error("STOMP Connection error", error);
      }
    );

    return () => {
      if (stompClient.connected) stompClient.disconnect();
    };
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/orders/${orderId}/status`, {
        status: newStatus,
      });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Filter orders by active tab
  const filteredOrders = useMemo(
    () => orders.filter((o) => o.status === activeTab),
    [orders, activeTab]
  );

  // Count per tab
  const counts = useMemo(() => {
    const c = {};
    TABS.forEach((t) => (c[t.key] = 0));
    orders.forEach((o) => {
      if (c[o.status] !== undefined) c[o.status]++;
    });
    return c;
  }, [orders]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "PAYMENT_PENDING":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "PAID":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "PREPARING":
        return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      case "SERVED":
        return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
      case "COMPLETED":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "REJECTED":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getTabColor = (color, isActive) => {
    if (!isActive)
      return "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10";
    switch (color) {
      case "orange":
        return "bg-orange-500/20 border-orange-500/40 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.15)]";
      case "blue":
        return "bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.15)]";
      case "emerald":
        return "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]";
      case "purple":
        return "bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]";
      case "cyan":
        return "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]";
      case "green":
        return "bg-green-500/20 border-green-500/40 text-green-300 shadow-[0_0_12px_rgba(34,197,94,0.15)]";
      case "red":
        return "bg-red-500/20 border-red-500/40 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.15)]";
      default:
        return "";
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            className="fixed top-4 right-4 z-[100] px-5 py-3 rounded-2xl bg-orange-500/90 text-black font-extrabold text-sm shadow-[0_0_30px_rgba(249,115,22,0.4)] backdrop-blur-xl border border-orange-400/50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Live Orders
          </h2>
          <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
            {connected ? (
              <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
            {connected ? "Connected • Real-time" : "Connecting..."}
          </p>
        </div>
        <div className="text-sm text-gray-400">
          {orders.length} total order{orders.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${getTabColor(
              tab.color,
              activeTab === tab.key
            )}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] min-w-[20px] text-center">
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order Cards Grid */}
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
                {TABS.find((t) => t.key === activeTab)?.icon || "📋"}
              </p>
              <h3 className="text-lg font-bold mt-3 text-white">
                No {activeTab.toLowerCase()} orders
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Orders with status "{activeTab}" will appear here.
              </p>
            </motion.div>
          ) : (
            filteredOrders.map((order) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: -20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.3 }}
                key={order.id}
                className="glass-panel border border-glass-border shadow-glass hover:shadow-neon transition-all duration-300 relative overflow-hidden group"
              >
                {/* Left accent stripe */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    getStatusColor(order.status).split(" ")[1]
                  }`}
                />

                <div className="p-5 pl-4">
                  {/* Top row */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-white tracking-tight">
                        Table {order.tableNumber}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                          #{order.id}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {formatTime(order.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-widest ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-5">
                    {order.items &&
                      order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm border-b border-white/5 pb-2"
                        >
                          <span className="font-medium text-gray-200">
                            <span className="text-amber-400 font-bold mr-1">
                              {item.quantity}×
                            </span>
                            {item.menuItemName}
                          </span>
                          <span className="text-gray-500 font-medium tabular-nums">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-gray-300 text-sm">
                        Grand Total
                      </span>
                      <span className="text-lg font-extrabold text-white">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {order.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, "PAYMENT_PENDING")}
                          className="px-4 py-2.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 rounded-xl text-[11px] uppercase tracking-wider font-extrabold transition-all hover:scale-[1.02]"
                        >
                          ✅ Accept Order
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
                        💳 Waiting for customer payment...
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
                        🏁 Complete Order
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
  );
}
