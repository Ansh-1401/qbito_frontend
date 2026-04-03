import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review State
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.userId) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/orders/user/${user.userId}`)
        .then((res) => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load orders", err);
          setLoading(false);
        });
    }
  }, [user?.userId]);

  const getStatusColor = (status) => {
    const map = {
      PENDING: "text-orange-400 bg-orange-400/10 border-orange-400/20",
      PAYMENT_PENDING: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      PAID: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      PREPARING: "text-purple-400 bg-purple-400/10 border-purple-400/20",
      SERVED: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
      COMPLETED: "text-green-400 bg-green-400/10 border-green-400/20",
      REJECTED: "text-red-400 bg-red-400/10 border-red-400/20",
    };
    return map[status] || "text-gray-400 bg-gray-400/10";
  };

  const formatTime = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

  const submitReview = async () => {
    if (!reviewOrder) return;
    setSubmittingReview(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/reviews`, {
        restaurantId: reviewOrder.restaurantId,
        rating,
        comment
      });
      alert("Review submitted successfully! Thank you ⭐");
      setReviewOrder(null);
      setComment("");
      setRating(5);
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0B0F19]/85 backdrop-blur-xl border-b border-glass-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-full border border-glass-border bg-glass-light hover:bg-white/10 backdrop-blur-md transition text-sm font-medium shadow-sm"
          >
            ← Back
          </button>
          <div className="text-center font-extrabold text-xl">My Orders</div>
          <div className="w-[84px]"></div> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        
        {/* REVIEW MODAL OVERLAY */}
        <AnimatePresence>
          {reviewOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-[#0B0F19] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
              >
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">🍽️</div>
                  <h3 className="text-xl font-extrabold text-white">How was your meal?</h3>
                  <p className="text-xs text-gray-400 mt-1">Rate your order from Table {reviewOrder.tableNumber}</p>
                </div>

                <div className="flex justify-center gap-2 mb-6 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-transform hover:scale-110 ${star <= rating ? 'text-amber-400' : 'text-gray-600'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Leave a comment (optional)..."
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 resize-none mb-6"
                />

                <div className="flex gap-3">
                  <button 
                    onClick={() => setReviewOrder(null)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 font-bold text-sm hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="flex-2 w-full py-3 rounded-xl bg-amber-500 text-black font-extrabold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:bg-amber-400 transition"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading your history...</div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl glass-panel p-10 text-center mx-auto max-w-lg mt-10 border border-glass-border"
          >
            <p className="text-5xl">🥡</p>
            <h2 className="mt-3 text-xl font-bold">No orders found</h2>
            <p className="mt-1 text-gray-400 text-sm">
              Looks like you haven't placed any orders yet. Discover our tables to get started!
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-3 rounded-2xl font-semibold bg-white text-black hover:bg-gray-200 transition"
            >
              Go to Home
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl glass-panel border border-glass-border relative overflow-hidden group"
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      getStatusColor(order.status).split(" ")[1]
                    }`}
                  />
                  <div className="p-6 pl-5">
                    {/* Upper row */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-white">
                          Order #{order.id}
                        </h3>
                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                          {formatTime(order.createdAt)} • Table {order.tableNumber}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-full border text-[10px] font-extrabold uppercase tracking-widest ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.replace("_", " ")}
                      </div>
                    </div>

                    {/* Items row */}
                    <div className="mb-4 text-sm text-gray-300">
                      {order.items?.map((item, idx) => (
                        <span key={item.id}>
                          <span className="font-semibold text-white">{item.quantity}×</span> {item.menuItemName}
                          {idx !== order.items.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="text-xl font-extrabold text-white">
                        ₹{order.totalAmount}
                      </div>

                      <div className="flex gap-3">
                        {/* If order is completed/served, they can review */}
                        {["COMPLETED", "SERVED"].includes(order.status) && (
                          <button
                            onClick={() => setReviewOrder(order)}
                            className="px-5 py-2.5 rounded-xl bg-white/5 text-amber-400 font-bold text-sm tracking-wider hover:bg-white/10 transition-all border border-amber-400/30"
                          >
                            ⭐ Leave Review
                          </button>
                        )}
                        
                        {/* Live active tracking */}
                        {["PENDING", "PAYMENT_PENDING", "PAID", "PREPARING", "SERVED"].includes(order.status) && (
                          <Link
                            to="/order-tracking"
                            state={{
                              orderId: order.id,
                              grandTotal: order.totalAmount,
                              tableNo: order.tableNumber,
                              slug: "demo",
                              restaurantName: "Restaurant"
                            }}
                            className="px-5 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 font-bold text-sm tracking-wider hover:bg-orange-500/30 transition-all border border-orange-500/30"
                          >
                            Track Live →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
