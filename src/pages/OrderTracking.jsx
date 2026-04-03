import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { loadRazorpayScript } from "../utils/razorpay";
import axios from "axios";
import api from "../config/api";

export default function OrderTracking() {
  const location = useLocation();
  const navigate = useNavigate();

  const orderId = location.state?.orderId;
  const grandTotal = location.state?.grandTotal || 0;
  const slug = location.state?.slug || "demo";
  const tableNo = location.state?.tableNo || 1;
  const restaurantName = location.state?.restaurantName || "Restaurant";

  const [status, setStatus] = useState("PENDING");
  const [paying, setPaying] = useState(false);
  const [rzpOrderId, setRzpOrderId] = useState(null);

  // Connect WebSocket to listen for status changes
  useEffect(() => {
    if (!orderId) return;

    api
      .get(`/orders/${orderId}`)
      .then((res) => {
        setStatus(res.data.status);
        if (res.data.razorpayOrderId) setRzpOrderId(res.data.razorpayOrderId);
      })
      .catch(console.error);

    const wsUrl = import.meta.env.VITE_WS_URL || "wss://qbito-backend.onrender.com/ws";
    const socket = new SockJS(wsUrl);
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    stompClient.connect(
      {},
      () => {
        stompClient.subscribe(`/topic/order-status/${orderId}`, (message) => {
          const orderData = JSON.parse(message.body);
          setStatus(orderData.status);
          if (orderData.razorpayOrderId) setRzpOrderId(orderData.razorpayOrderId);
        });
      },
      (err) => console.error(err)
    );

    return () => {
      if (stompClient.connected) stompClient.disconnect();
    };
  }, [orderId]);

  // Handle Razorpay payment (only after restaurant accepts)
  const handlePayNow = async () => {
    if (paying) return;
    setPaying(true);

    try {
      // Dummy check for local testing
      if (rzpOrderId && rzpOrderId.startsWith("order_dummy_")) {
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/orders/${orderId}/pay`,
            { paymentId: "pay_dummy_" + Date.now(), signature: "dummy_sig" }
          );
        } catch (err) {
          console.error("Payment confirmation failed", err);
          alert("Payment confirmation failed.");
          setPaying(false);
        }
        return; 
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Razorpay SDK failed to load.");
        setPaying(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_dummykey12345",
        amount: grandTotal * 100,
        currency: "INR",
        name: restaurantName,
        description: `Order #${orderId} • Table ${tableNo}`,
        order_id: rzpOrderId,

        handler: async function (response) {
          try {
            // Confirm payment on backend
            await axios.post(
              `${import.meta.env.VITE_API_URL}/orders/${orderId}/pay`,
              { paymentId: response.razorpay_payment_id }
            );
          } catch (err) {
            console.error("Payment confirmation failed", err);
          }
        },

        modal: {
          ondismiss: () => setPaying(false),
        },

        prefill: {
          name: "Customer",
          email: "customer@gmail.com",
          contact: "9999999999",
        },

        theme: { color: "#0B0F19" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert(response?.error?.description || "Payment failed");
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong during payment!");
      setPaying(false);
    }
  };

  // Render based on status
  const renderContent = () => {
    switch (status) {
      case "PENDING":
        return (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="h-20 w-20 mx-auto rounded-3xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center"
            >
              <span className="text-4xl">⏳</span>
            </motion.div>
            <h2 className="mt-5 text-2xl font-extrabold">
              Waiting for restaurant...
            </h2>
            <p className="mt-2 text-gray-400 max-w-md mx-auto">
              Your order has been sent to{" "}
              <span className="text-white font-semibold">{restaurantName}</span>
              . Please wait while they review and confirm your order.
            </p>
            <div className="mt-6 flex justify-center">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex gap-1"
              >
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="h-2 w-2 rounded-full bg-orange-300" />
              </motion.div>
            </div>
          </motion.div>
        );

      case "PAYMENT_PENDING":
        return (
          <motion.div
            key="payment"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="h-20 w-20 mx-auto rounded-3xl bg-green-500/20 border border-green-400/30 flex items-center justify-center"
            >
              <span className="text-4xl">✅</span>
            </motion.div>
            <h2 className="mt-5 text-2xl font-extrabold text-green-400">
              Order Accepted!
            </h2>
            <p className="mt-2 text-gray-400 max-w-md mx-auto">
              {restaurantName} has accepted your order. Please complete the
              payment to proceed.
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handlePayNow}
              disabled={paying}
              className="mt-6 px-8 py-4 rounded-2xl bg-neon-orange text-black font-extrabold shadow-neon hover:opacity-95 transition disabled:opacity-60 text-lg"
            >
              {paying ? "Opening Razorpay..." : `Pay Now • ₹${grandTotal} →`}
            </motion.button>
          </motion.div>
        );

      case "REJECTED":
        return (
          <motion.div
            key="rejected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="h-20 w-20 mx-auto rounded-3xl bg-red-500/20 border border-red-400/30 flex items-center justify-center">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-red-400">
              Order Rejected
            </h2>
            <p className="mt-2 text-gray-400 max-w-md mx-auto">
              Unfortunately, {restaurantName} was unable to accept your order at
              this time. No payment has been charged.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link
                to={`/restro/${slug}/table/${tableNo}`}
                className="px-6 py-3 rounded-2xl bg-white/10 border border-white/10 font-semibold hover:bg-white/15 transition"
              >
                Try Again
              </Link>
              <Link
                to="/"
                className="px-6 py-3 rounded-2xl bg-white/10 border border-white/10 font-semibold hover:bg-white/15 transition"
              >
                Go Home
              </Link>
            </div>
          </motion.div>
        );

      case "PAID":
      case "PREPARING":
      case "SERVED":
      case "COMPLETED":
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="h-20 w-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center"
            >
              <span className="text-4xl">
                {status === "PAID"
                  ? "💰"
                  : status === "PREPARING"
                  ? "👨‍🍳"
                  : status === "SERVED"
                  ? "🍽️"
                  : "🏁"}
              </span>
            </motion.div>
            <h2 className="mt-5 text-2xl font-extrabold">
              {status === "PAID" && "Payment Successful!"}
              {status === "PREPARING" && "Being Prepared!"}
              {status === "SERVED" && "Food Served!"}
              {status === "COMPLETED" && "Order Complete!"}
            </h2>
            <p className="mt-2 text-gray-400 max-w-md mx-auto">
              {status === "PAID" &&
                "Payment confirmed ✅ The kitchen will start preparing your order shortly!"}
              {status === "PREPARING" &&
                "The chef is currently preparing your delicious food 👨‍🍳"}
              {status === "SERVED" &&
                "Your food has been served to your table. Enjoy! 🍽️"}
              {status === "COMPLETED" &&
                "Thank you for dining with us! Hope you enjoyed your meal 💙"}
            </p>

            {/* Live Status Badge */}
            <motion.div
              key={status}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-sm"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#22c55e]" />
              {status}
            </motion.div>

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link
                to={`/restro/${slug}/table/${tableNo}`}
                className="px-6 py-3 rounded-2xl bg-neon-orange text-black font-extrabold shadow-neon hover:opacity-95 transition"
              >
                Order Again 🔁
              </Link>
              <Link
                to="/"
                className="px-6 py-3 rounded-2xl bg-white/10 border border-white/10 font-semibold hover:bg-white/15 transition"
              >
                Back to Home 🏠
              </Link>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🤷</p>
          <p className="text-gray-400">No order found.</p>
          <Link
            to="/"
            className="mt-4 inline-block px-6 py-3 rounded-2xl bg-white text-black font-bold"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-hidden relative">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-40 overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-orange-500 blur-3xl"
          animate={{ x: [0, 35, 0], y: [0, 25, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-24 -right-20 h-72 w-72 rounded-full bg-cyan-500 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-purple-500 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -25, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">🧾</span>
                <span className="text-sm text-gray-300 font-semibold">
                  Order #{orderId}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                Table {tableNo} • {restaurantName}
              </span>
            </div>

            {/* Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
            </div>

            {/* Order amount footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex items-center justify-between">
              <span className="text-sm text-gray-400">Order Total</span>
              <span className="text-lg font-extrabold">₹{grandTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
