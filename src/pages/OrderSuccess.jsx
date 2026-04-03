import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

export default function OrderSuccess() {
  const location = useLocation();

  // optional data: you can pass orderId, restaurantSlug, tableNo via navigate state
  const orderId = location.state?.orderId || "S2D-" + Math.floor(Math.random() * 100000);
  const paymentId = location.state?.paymentId || "pending";
  const slug = location.state?.slug || "demo";
  const tableNo = location.state?.tableNo || 1;

  const [orderStatus, setOrderStatus] = useState("PENDING");

  useEffect(() => {
    if (!orderId || (typeof orderId === 'string' && orderId.startsWith("S2D"))) return;
    
    const socket = new SockJS(import.meta.env.VITE_WS_URL);
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {}; 
    
    stompClient.connect({}, () => {
      stompClient.subscribe(`/topic/order-status/${orderId}`, (message) => {
        const orderData = JSON.parse(message.body);
        setOrderStatus(orderData.status);
      });
    }, (err) => console.error(err));

    return () => {
      if (stompClient.connected) stompClient.disconnect();
    };
  }, [orderId]);
  
  const getStatusDisplay = () => {
    switch (orderStatus) {
      case "PENDING": return { text: "Order Sent", color: "text-orange-400" };
      case "ACCEPTED": return { text: "Accepted", color: "text-blue-400" };
      case "PREPARING": return { text: "Preparing", color: "text-purple-400" };
      case "SERVED": return { text: "Served", color: "text-cyan-400" };
      case "COMPLETED": return { text: "Completed", color: "text-green-500" };
      case "REJECTED": return { text: "Rejected", color: "text-red-500" };
      default: return { text: "Confirmed", color: "text-emerald-300" };
    }
  };
  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-hidden relative">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-45 overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-emerald-500 blur-3xl"
          animate={{ x: [0, 35, 0], y: [0, 25, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-24 -right-20 h-72 w-72 rounded-full bg-cyan-500 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-fuchsia-500 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -25, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          {/* Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Top bar */}
            <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-emerald-500/15 to-cyan-500/10">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/10">
                  <span>🧾</span>
                  <span className="text-sm text-gray-200">Payment Success</span>
                </div>

                <div className="text-xs sm:text-sm text-gray-200 px-3 py-1 rounded-full bg-black/20 border border-white/10">
                  Order ID: <span className="font-semibold">{orderId}</span>
                </div>
              </div>

              {/* Success Icon */}
              <div className="mt-6 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.7, rotate: -10, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  className="h-20 w-20 rounded-3xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="text-4xl"
                  >
                    ✅
                  </motion.div>
                </motion.div>
              </div>

              <h1 className="mt-5 text-center text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
                Order Placed{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
                  Successfully!
                </span>
              </h1>

              <p className="mt-2 text-center text-gray-300 max-w-lg mx-auto leading-relaxed">
                Payment successful ✅ Keep this tab open—your order status will update <span className="font-bold text-white">live</span> right here as the kitchen prepares it! 🍽️
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Info boxes */}
              <div className="grid sm:grid-cols-3 gap-3">
                <motion.div 
                  key={orderStatus}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-glass"
                >
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Live Status</p>
                  <p className={`mt-1 font-extrabold tracking-wide uppercase ${statusDisplay.color}`}>{statusDisplay.text}</p>
                </motion.div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Table</p>
                  <p className="mt-1 font-semibold text-white">#{tableNo}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 relative overflow-hidden">
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest break-all absolute top-2 right-2">txn_{paymentId.substring(0, 8)}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-bold">Payment</p>
                  <p className="mt-1 font-semibold text-white">Razorpay <span className="text-xs">✅</span></p>
                </div>
              </div>

              {/* Next steps */}
              <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="font-semibold text-white">What happens next?</p>
                <div className="mt-4 grid sm:grid-cols-3 gap-3 text-gray-300">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xl">👨‍🍳</p>
                    <p className="mt-1 font-semibold text-white">Preparing</p>
                    <p className="text-xs mt-1 text-gray-300">
                      Kitchen starts making your order.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xl">🔔</p>
                    <p className="mt-1 font-semibold text-white">Notification</p>
                    <p className="text-xs mt-1 text-gray-300">
                      Restaurant receives your request.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xl">🍽️</p>
                    <p className="mt-1 font-semibold text-white">Serve</p>
                    <p className="text-xs mt-1 text-gray-300">
                      Food is served on your table.
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                <Link
                  to={`/restro/${slug}/table/${tableNo}`}
                  className="text-center rounded-2xl px-6 py-3 font-extrabold bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-black hover:opacity-95 transition shadow-xl"
                >
                  Order Again 🔁
                </Link>

                <Link
                  to="/"
                  className="text-center rounded-2xl px-6 py-3 font-semibold bg-white/10 border border-white/10 hover:bg-white/15 transition"
                >
                  Back to Home 🏠
                </Link>
              </div>

              {/* Footer small */}
              <p className="mt-6 text-center text-xs text-gray-400">
                Thanks for using QBito 💙
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
