import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import api from "../config/api";

function VegBadge({ type = "veg" }) {
  const isVeg = type === "veg";
  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-[11px] border ${
        isVeg
          ? "bg-green-500/10 border-green-500/30 text-green-200"
          : "bg-red-500/10 border-red-500/30 text-red-200"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${isVeg ? "bg-green-400" : "bg-red-400"}`}
      />
      {isVeg ? "VEG" : "NON-VEG"}
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    cart = [],
    restaurantInfo,
    increaseQty,
    decreaseQty,
    clearCart,
    totalQty = 0,
    totalAmount = 0,
  } = useCart();

  const [placing, setPlacing] = useState(false);

  const charges = useMemo(() => {
    const itemTotal = Number(totalAmount || 0);
    const gst = Math.round(itemTotal * 0.05);
    const platformFee = itemTotal > 0 ? 5 : 0;
    const delivery = 0;
    const grandTotal = itemTotal + gst + platformFee + delivery;
    return { itemTotal, gst, platformFee, delivery, grandTotal };
  }, [totalAmount]);

  // Step 1: ONLY place order — NO payment
  const handlePlaceOrder = async () => {
    if (!Array.isArray(cart) || cart.length === 0) return;
    if (placing) return;

    setPlacing(true);

    try {
      const orderPayload = {
        restaurantId: restaurantInfo?.id || 1,
        userId: user?.userId || null, // Null if customer is an unregistered guest
        tableNumber: String(restaurantInfo?.tableNo || "1"),
        totalAmount: charges.grandTotal,
        items: cart.map((c) => ({
          menuItemId: Number(c.id || c._id),
          name: c.name,
          price: Number(c.price),
          quantity: Number(c.qty),
        })),
      };

      const { data: savedOrder } = await api.post(`/orders`, orderPayload);

      clearCart();

      // Navigate to order tracking page — payment will happen there AFTER restaurant accepts
      navigate("/order-tracking", {
        state: {
          orderId: savedOrder.id,
          grandTotal: charges.grandTotal,
          slug: restaurantInfo?.slug || "demo",
          tableNo: restaurantInfo?.tableNo || 1,
          restaurantName: restaurantInfo?.restaurantName || restaurantInfo?.name || "Restaurant",
        },
      });
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0B0F19]/85 backdrop-blur-xl border-b border-glass-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-full border border-glass-border bg-glass-light hover:bg-white/10 backdrop-blur-md transition text-sm font-medium shadow-sm"
          >
            ← Back
          </button>

          <div className="text-center flex-1">
            <h1 className="text-lg sm:text-xl font-extrabold">Your Cart</h1>
            <p className="text-xs sm:text-sm text-gray-300">
              {(restaurantInfo?.restaurantName ||
                restaurantInfo?.name ||
                "Restaurant") +
                (restaurantInfo?.tableNo
                  ? ` • Table ${restaurantInfo.tableNo}`
                  : "")}
            </p>
          </div>

          <button
            onClick={clearCart}
            className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-200 hover:bg-red-500/20 transition disabled:opacity-50"
            disabled={!Array.isArray(cart) || cart.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
        {!Array.isArray(cart) || cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl glass-panel p-10 text-center mx-auto max-w-lg mt-10"
          >
            <p className="text-5xl">🛒</p>
            <h2 className="mt-3 text-xl font-bold">Your cart is empty</h2>
            <p className="mt-1 text-gray-300 text-sm">
              Add delicious items from menu and come back here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-3 rounded-2xl font-semibold bg-white text-black hover:bg-gray-200 transition"
            >
              Go Home
            </button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-6">
            {/* Items */}
            <div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Items</h2>
                  <p className="text-sm text-gray-300">
                    {totalQty} item{totalQty > 1 ? "s" : ""} in your cart
                  </p>
                </div>
              </div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
                }}
                className="grid gap-4"
              >
                <AnimatePresence>
                  {cart.map((item, idx) => {
                    const id = item?.id ?? item?._id ?? `${item?.name}-${idx}`;
                    const qty = Number(item?.qty || 1);
                    const price = Number(item?.price || 0);
                    const itemTotal = qty * price;

                    return (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-3xl overflow-hidden glass-panel hover:neon-active transition"
                      >
                        <div className="p-4 sm:p-5 flex gap-4">
                          <div className="relative shrink-0">
                            <img
                              src={
                                item?.image ||
                                "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80"
                              }
                              alt={item?.name || "Food"}
                              className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover"
                            />
                            <div className="absolute -top-2 -left-2">
                              <VegBadge type={item?.type || "veg"} />
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-lg font-bold">
                                  {item?.name || "Item"}
                                </h3>
                                <p className="text-sm text-gray-300 mt-1">
                                  ₹{price} • {item?.category || "Item"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-300">
                                  Item total
                                </p>
                                <p className="text-lg font-extrabold">
                                  ₹{Number.isFinite(itemTotal) ? itemTotal : 0}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-2 py-1.5">
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => decreaseQty(id)}
                                  className="h-10 w-10 rounded-xl bg-white text-black font-extrabold hover:bg-gray-200 transition"
                                >
                                  −
                                </motion.button>
                                <div className="min-w-[56px] text-center">
                                  <p className="text-xs text-gray-300">Qty</p>
                                  <p className="text-lg font-extrabold">
                                    {qty}
                                  </p>
                                </div>
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => increaseQty(id)}
                                  className="h-10 w-10 rounded-xl bg-neon-orange text-black font-extrabold hover:opacity-95 transition"
                                >
                                  +
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Bill */}
            <div className="lg:sticky lg:top-[92px] h-fit">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl glass-panel p-6 shadow-glass relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none" />
                <h3 className="text-lg font-extrabold">Bill Details</h3>

                <div className="mt-4 space-y-3 text-sm text-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Item Total</span>
                    <span className="font-semibold">₹{charges.itemTotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">GST (5%)</span>
                    <span className="font-semibold">₹{charges.gst}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Platform Fee</span>
                    <span className="font-semibold">
                      ₹{charges.platformFee}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Delivery</span>
                    <span className="font-semibold">₹{charges.delivery}</span>
                  </div>
                  <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                    <span className="text-gray-100 font-bold">Grand Total</span>
                    <span className="text-xl font-extrabold">
                      ₹{charges.grandTotal}
                    </span>
                  </div>
                </div>

                {/* Place Order — NOT Pay Now */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="mt-6 w-full rounded-[20px] bg-neon-orange text-black font-extrabold px-5 py-4 shadow-neon hover:opacity-95 transition-transform disabled:opacity-60 border border-white/20"
                >
                  {placing
                    ? "Placing Order..."
                    : `Place Order • ₹${charges.grandTotal} →`}
                </motion.button>

                <p className="mt-3 text-center text-[11px] text-gray-500">
                  Payment will be collected after restaurant confirms your order
                </p>

                <button
                  onClick={() => navigate(-1)}
                  className="mt-3 w-full rounded-[20px] glass-panel border border-glass-border text-white font-semibold px-5 py-3 hover:bg-white/10 transition"
                >
                  Add more items
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bar */}
      <AnimatePresence>
        {totalQty > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 26 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-4 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 lg:hidden"
          >
            <button
              disabled={placing}
              onClick={handlePlaceOrder}
              className="w-full rounded-2xl bg-neon-orange text-black font-extrabold px-5 py-4 shadow-neon flex items-center justify-between gap-3 disabled:opacity-60"
            >
              <span className="text-sm">🛒 {totalQty} items</span>
              <span className="text-sm">
                {placing
                  ? "Placing..."
                  : `Place Order ₹${charges.grandTotal} →`}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
