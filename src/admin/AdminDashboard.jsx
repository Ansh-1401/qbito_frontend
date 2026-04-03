import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/restaurants`)
      .then((res) => setRestaurants(res.data))
      .catch(() => {});
    axios
      .get(`${import.meta.env.VITE_API_URL}/orders/restaurant/1`)
      .then((res) => setOrders(res.data))
      .catch(() => {});
  }, []);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const preparing = orders.filter((o) => o.status === "PREPARING").length;
    const completed = orders.filter((o) => o.status === "COMPLETED").length;
    const revenue = orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return { pending, preparing, completed, revenue, total: orders.length };
  }, [orders]);

  const statCards = [
    {
      label: "🔔 New Orders",
      value: stats.pending,
      color: "from-orange-500/20 to-orange-600/5 border-orange-500/20",
      textColor: "text-orange-400",
    },
    {
      label: "👨‍🍳 Preparing",
      value: stats.preparing,
      color: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
      textColor: "text-purple-400",
    },
    {
      label: "✅ Completed",
      value: stats.completed,
      color: "from-green-500/20 to-green-600/5 border-green-500/20",
      textColor: "text-green-400",
    },
    {
      label: "💰 Revenue",
      value: `₹${stats.revenue}`,
      color: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
      textColor: "text-cyan-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-2xl border bg-gradient-to-br p-5 ${card.color}`}
          >
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              {card.label}
            </p>
            <p className={`text-3xl font-extrabold mt-2 ${card.textColor}`}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-panel border border-glass-border p-6">
        <h2 className="text-xl font-extrabold tracking-tight">
          Quick Actions
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""} •{" "}
          {stats.total} total orders
        </p>

        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/admin/orders")}
            className="px-5 py-4 rounded-2xl bg-orange-500/15 border border-orange-500/25 text-orange-300 font-bold hover:bg-orange-500/25 transition-all text-left"
          >
            <span className="text-2xl">📡</span>
            <p className="mt-2 font-extrabold">Live Orders</p>
            <p className="text-xs text-gray-400 mt-1">
              Real-time order management
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/restaurants")}
            className="px-5 py-4 rounded-2xl bg-blue-500/15 border border-blue-500/25 text-blue-300 font-bold hover:bg-blue-500/25 transition-all text-left"
          >
            <span className="text-2xl">🏪</span>
            <p className="mt-2 font-extrabold">Restaurants</p>
            <p className="text-xs text-gray-400 mt-1">Manage your venues</p>
          </button>

          <button
            onClick={() => navigate("/admin/qr")}
            className="px-5 py-4 rounded-2xl bg-purple-500/15 border border-purple-500/25 text-purple-300 font-bold hover:bg-purple-500/25 transition-all text-left"
          >
            <span className="text-2xl">📱</span>
            <p className="mt-2 font-extrabold">QR Generator</p>
            <p className="text-xs text-gray-400 mt-1">
              Generate table QR codes
            </p>
          </button>
        </div>
      </div>

      {/* Recent Orders Preview */}
      {orders.length > 0 && (
        <div className="glass-panel border border-glass-border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-extrabold">Recent Orders</h3>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-xs text-orange-400 font-bold uppercase tracking-wider hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                  <th className="text-left py-3 pr-4">ID</th>
                  <th className="text-left py-3 pr-4">Table</th>
                  <th className="text-left py-3 pr-4">Items</th>
                  <th className="text-left py-3 pr-4">Amount</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3 pr-4 text-gray-400 font-mono">
                      #{order.id}
                    </td>
                    <td className="py-3 pr-4 font-semibold">
                      {order.tableNumber}
                    </td>
                    <td className="py-3 pr-4 text-gray-400">
                      {order.items?.length || 0} items
                    </td>
                    <td className="py-3 pr-4 font-bold">
                      ₹{order.totalAmount}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          order.status === "PENDING"
                            ? "text-orange-400 bg-orange-400/10 border-orange-400/20"
                            : order.status === "COMPLETED"
                            ? "text-green-400 bg-green-400/10 border-green-400/20"
                            : order.status === "PREPARING"
                            ? "text-purple-400 bg-purple-400/10 border-purple-400/20"
                            : "text-gray-400 bg-gray-400/10 border-gray-400/20"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
