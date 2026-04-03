import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/superadmin/orders`)
      .then((res) => setOrders(res.data))
      .catch(console.error);
  }, []);

  const filtered =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const statusColor = (s) => {
    const map = {
      PENDING: "text-orange-400 bg-orange-400/10",
      PAYMENT_PENDING: "text-blue-400 bg-blue-400/10",
      PAID: "text-emerald-400 bg-emerald-400/10",
      PREPARING: "text-purple-400 bg-purple-400/10",
      SERVED: "text-cyan-400 bg-cyan-400/10",
      COMPLETED: "text-green-400 bg-green-400/10",
      REJECTED: "text-red-400 bg-red-400/10",
    };
    return map[s] || "text-gray-400 bg-gray-400/10";
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">All Orders</h1>
      <p className="text-gray-500 text-sm mt-1">
        Viewing {filtered.length} of {orders.length} orders across all
        restaurants
      </p>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          "ALL",
          "PENDING",
          "PAYMENT_PENDING",
          "PAID",
          "PREPARING",
          "SERVED",
          "COMPLETED",
          "REJECTED",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              filter === s
                ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="mt-5 rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left font-bold">ID</th>
              <th className="px-4 py-3 text-left font-bold">Restaurant</th>
              <th className="px-4 py-3 text-left font-bold">Table</th>
              <th className="px-4 py-3 text-left font-bold">Items</th>
              <th className="px-4 py-3 text-left font-bold">Total</th>
              <th className="px-4 py-3 text-left font-bold">Status</th>
              <th className="px-4 py-3 text-left font-bold">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No orders found
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/[0.02] transition"
                >
                  <td className="px-4 py-3 text-gray-500">#{o.id}</td>
                  <td className="px-4 py-3 text-gray-400">
                    ID: {o.restaurantId}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    #{o.tableNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {o.items?.length || 0} items
                  </td>
                  <td className="px-4 py-3 font-bold">₹{o.totalAmount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {o.paymentDone ? (
                      <span className="text-green-400 text-xs font-bold">
                        ✅ Paid
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">Unpaid</span>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
