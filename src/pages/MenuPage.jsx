import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../Context/CartContext";
import axios from "axios";
import api from "../config/api";

// ✅ Demo data (later backend se aayega)
const MENU_DATA = {
  "pizza-hub": {
    name: "Pizza Plaza",
    address: "Digiha, Bahraich",
    openTime: "11:00 AM - 11:00 PM",
    cover:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1400&auto=format&fit=crop",
    menu: [
      {
        id: 101,
        name: "Margherita Pizza",
        price: 199,
        category: "Pizza",
        type: "veg",
        desc: "Classic cheese & tomato base",
        image:
          "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?q=80&w=1200&auto=format&fit=crop",
      },
      {
        id: 102,
        name: "Farmhouse Pizza",
        price: 299,
        category: "Pizza",
        type: "veg",
        desc: "Loaded with veggies & cheese",
        image:
          "https://images.unsplash.com/photo-1544982503-7b1c5d3f1d73?q=80&w=1200&auto=format&fit=crop",
      },
      {
        id: 103,
        name: "Chicken Pepperoni Pizza",
        price: 349,
        category: "Pizza",
        type: "nonveg",
        desc: "Pepperoni + cheese overload",
        image:
          "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=1200&auto=format&fit=crop",
      },
      {
        id: 104,
        name: "Garlic Bread",
        price: 129,
        category: "Sides",
        type: "veg",
        desc: "Buttery garlic bread",
        image:
          "https://images.unsplash.com/photo-1619872606744-46847c47b2a1?q=80&w=1200&auto=format&fit=crop",
      },
      {
        id: 105,
        name: "Coke",
        price: 49,
        category: "Drinks",
        type: "veg",
        desc: "Chilled & refreshing",
        image:
          "https://images.unsplash.com/photo-1622483748357-78c2c2fba1ac?q=80&w=1200&auto=format&fit=crop",
      },
      {
        id: 106,
        name: "Cold Coffee",
        price: 99,
        category: "Drinks",
        type: "veg",
        desc: "Creamy chilled coffee",
        image:
          "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },

  demo: {
    name: "Sanjha Chulha",
    address: "Bahraich, India",
    openTime: "10:00 AM - 11:00 PM",
    cover:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=80",
    menu: [
      {
        id: 1,
        name: "Paneer Butter Masala",
        price: 220,
        category: "Main Course",
        type: "veg",
        desc: "Creamy buttery paneer gravy",
        image:
          "https://images.unsplash.com/photo-1604908177225-6f268d5e6d86?q=80&w=1200&auto=format&fit=crop",
      },
      {
        id: 2,
        name: "Butter Naan",
        price: 40,
        category: "Breads",
        type: "veg",
        desc: "Soft naan brushed with butter",
        image:
          "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1200&auto=format&fit=crop",
      },
      {
        id: 3,
        name: "Chicken Curry",
        price: 260,
        category: "Main Course",
        type: "nonveg",
        desc: "Spicy chicken curry (desi style)",
        image:
          "https://images.unsplash.com/photo-1604909052772-4e1b324d1b7a?q=80&w=1200&auto=format&fit=crop",
      },
      {
        id: 4,
        name: "Cold Coffee",
        price: 90,
        category: "Drinks",
        type: "veg",
        desc: "Sweet cold coffee",
        image:
          "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const card = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
};

function VegBadge({ type }) {
  const isVeg = type === "veg";
  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border ${
        isVeg
          ? "bg-green-500/10 border-green-500/30 text-green-200"
          : "bg-red-500/10 border-red-500/30 text-red-200"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${isVeg ? "bg-green-400" : "bg-red-400"}`} />
      {isVeg ? "VEG" : "NON-VEG"}
    </div>
  );
}

export default function MenuPage() {
  const { slug, tableNo } = useParams();
  const navigate = useNavigate();

  const {
    addToCart,
    increaseQty,
    decreaseQty,
    getQty,
    totalQty,
    totalAmount,
    setRestaurantInfo,
  } = useCart();

  const [restro, setRestro] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

  const table = tableNo ? String(tableNo) : "0";

  // ✅ FIXED: no infinite loop now
  useEffect(() => {
    setError(null);
    Promise.all([
      api.get(`/restaurants/slug/${slug}`),
      api.get(`/restaurants/slug/${slug}/menu`)
    ])
      .then(([restroRes, menuRes]) => {
        const data = {
          id: restroRes.data.id,
          name: restroRes.data.name,
          address: restroRes.data.address,
          openTime: restroRes.data.openTime,
          cover: restroRes.data.cover,
          rating: restroRes.data.rating,
          menu: Array.isArray(menuRes.data) ? menuRes.data.map(item => ({
            ...item,
            desc: item.description
          })) : []
        };
        setRestro(data);

        // Fetch reviews for this restaurant
        api.get(`/reviews/restaurant/${restroRes.data.id}`)
          .then(res => setReviews(res.data))
          .catch(err => console.error("Could not fetch reviews:", err));

        // ✅ set only when slug/table changes
        setRestaurantInfo({
          id: restroRes.data.id,
          slug,
          tableNo: table,
          restaurantName: data.name,
        });
      })
      .catch((err) => {
        console.error("Failed to load restaurant info:", err);
        setError("Restaurant not found or could not be loaded.");
      });
  }, [slug, table]);

  const categories = useMemo(() => {
    if (!restro) return ["All"];
    const set = new Set(restro.menu.map((x) => x.category));
    return ["All", ...Array.from(set)];
  }, [restro]);

  const filteredMenu = useMemo(() => {
    if (!restro) return [];
    return restro.menu.filter((item) => {
      const matchSearch = (item.name + " " + item.category + " " + item.desc)
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchCat = activeCategory === "All" ? true : item.category === activeCategory;

      return matchSearch && matchCat;
    });
  }, [restro, search, activeCategory]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-6 text-center">
        <div className="glass-panel p-10 border border-red-500/30">
          <p className="text-4xl mb-4">🏪</p>
          <h2 className="text-2xl font-extrabold">{error}</h2>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition text-sm font-bold"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!restro) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="text-center font-bold animate-pulse text-gray-500">
          Fetching Menu...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-x-hidden relative">
      {/* Premium Glass Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 opacity-40 overflow-hidden z-0">
        <motion.div
          className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-orange-600/30 blur-[100px]"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-purple-900/30 blur-[100px]"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-amber-500/20 blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ✅ Wrapper */}
      <div className="relative z-10 w-full">
        {/* ✅ Cover */}
        <div className="relative">
          <img
            src={restro.cover}
            alt="cover"
            className="h-[260px] sm:h-[350px] w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/20 via-[#0B0F19]/60 to-[#0B0F19]" />

          {/* Top buttons */}
          <div className="absolute top-6 left-4 right-4 max-w-7xl mx-auto flex justify-between z-10 px-2 lg:px-8">
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2 rounded-full border border-glass-border bg-glass-light hover:bg-white/10 backdrop-blur-md transition text-sm font-medium shadow-sm"
            >
              ← Back
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="px-5 py-2 rounded-full bg-neon-orange text-black font-extrabold tracking-wide hover:opacity-90 shadow-neon transition text-sm"
            >
              Cart ({totalQty})
            </button>
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute bottom-5 left-4 right-4 z-10 max-w-7xl mx-auto px-2 lg:px-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-lg flex items-center flex-wrap gap-4">
                  {restro.name}
                  {restro.rating > 0 && (
                    <span className="text-xl sm:text-2xl bg-amber-500/20 text-amber-500 px-4 py-2 rounded-2xl border border-amber-500/30 flex items-center gap-1">
                      ⭐ {restro.rating}
                    </span>
                  )}
                </h1>
                <p className="text-gray-300 mt-2 tracking-wide font-medium">{restro.address}</p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">🕒 {restro.openTime}</p>

                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-glass-border bg-black/40 backdrop-blur">
                  <span className="text-sm">📍</span>
                  <span className="text-xs font-semibold text-amber-500 tracking-wider">
                    TABLE: {table === "0" ? "NOT SELECTED" : table}
                  </span>
                </div>
              </div>

              {/* Search */}
              <div className="w-full lg:w-[420px] glass-panel p-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search in menu..."
                  className="w-full bg-transparent outline-none text-white placeholder:text-gray-500 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </motion.div>
        </div>

      {/* ✅ Sticky categories & Tabs */}
      <div className="sticky top-0 z-30 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveCategory("Reviews")}
              className={`shrink-0 px-5 py-2 rounded-full border transition-all duration-300 font-medium text-sm tracking-wide ${
                activeCategory === "Reviews"
                  ? "bg-amber-500 border-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)] font-extrabold"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
              }`}
            >
              ⭐ Reviews ({reviews?.length || 0})
            </button>
            <div className="w-[1px] bg-white/10 mx-1 border-r border-[#0B0F19]"></div>
            
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-5 py-2 rounded-full border transition-all duration-300 font-medium text-sm tracking-wide ${
                  activeCategory === cat
                    ? "bg-glass-light border-neon-orange text-neon-orange shadow-neon"
                    : "bg-transparent text-gray-400 border-transparent hover:border-glass-border hover:bg-glass-light hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Dynamic Content: Reviews OR Menu Items */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-28">
        {activeCategory === "Reviews" ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <div className="glass-panel p-8 text-center text-gray-500 mt-4 max-w-md mx-auto italic">
                No reviews yet. Be the first to leave one after ordering!
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {reviews.map(rev => (
                  <div key={rev.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 relative">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-extrabold text-white text-lg">{rev.username}</div>
                      <div className="flex text-amber-400 text-lg">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < rev.rating ? "opacity-100" : "opacity-20"}>★</span>
                        ))}
                      </div>
                    </div>
                    {rev.comment && <p className="text-sm text-gray-300 mt-2 italic leading-relaxed">"{rev.comment}"</p>}
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">
                      {new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Menu</h2>
                <p className="text-sm text-gray-300">{filteredMenu.length} items</p>
              </div>
              <p className="hidden sm:block text-sm text-gray-300">
                Use + / - to manage quantity
              </p>
            </div>

            {filteredMenu.length === 0 ? (
              <div className="glass-panel p-8 text-center text-gray-400 mt-8 max-w-md mx-auto">
                <span className="text-3xl block mb-2">🍽️</span>
                No items found in this category.
              </div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4"
              >
                {filteredMenu.map((itemData) => {
                  const qty = getQty(itemData.id);

                  return (
                    <motion.div
                      key={itemData.id}
                      variants={card}
                      whileHover={{ y: -4 }}
                      className={`relative group rounded-3xl overflow-hidden glass-panel flex flex-col transition-all duration-300 ${qty > 0 ? "neon-active" : "border-glass-border hover:border-white/20"}`}
                    >
                      {/* image */}
                      <div className="m-3 mb-0 relative rounded-2xl overflow-hidden h-44 sm:h-48 border border-glass-border">
                        <img
                          src={itemData.image}
                          alt={itemData.name}
                          className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md rounded-lg p-1 px-2 border border-white/10">
                          <VegBadge type={itemData.type} />
                        </div>

                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-glass-border text-sm font-extrabold text-amber-500 shadow-lg drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                          ₹{itemData.price}
                        </div>
                      </div>

                      {/* details */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white mb-2 drop-shadow-sm">{itemData.name}</h3>
                          <p className="text-[12px] text-gray-400 font-medium tracking-wide line-clamp-2 leading-relaxed">
                            {itemData.desc}
                          </p>
                        </div>

                        {/* qty controls */}
                        <div className="mt-5">
                          {qty === 0 ? (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => addToCart(itemData)}
                              className="w-full rounded-2xl py-3 font-semibold text-xs uppercase tracking-wider bg-glass-light border border-glass-border text-white hover:bg-neon-orange hover:border-neon-orange hover:text-black transition-all shadow-sm drop-shadow-sm"
                            >
                              + Add to Cart
                            </motion.button>
                          ) : (
                            <div className="flex items-center justify-between gap-3 rounded-2xl border border-neon-orange bg-black/40 px-3 py-2 shadow-neon transition-all">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => decreaseQty(itemData.id)}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-glass-light text-white font-extrabold hover:bg-white/20 transition border border-glass-border"
                              >
                                −
                              </motion.button>

                              <div className="text-center flex-1">
                                <p className="text-[10px] text-neon-orange font-bold uppercase tracking-wider">Qty</p>
                                <p className="text-xl font-extrabold text-white leading-none drop-shadow-md">{qty}</p>
                              </div>

                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => increaseQty(itemData.id)}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-neon-orange text-black font-extrabold hover:opacity-90 transition shadow-neon"
                              >
                                +
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ✅ Floating cart bar */}
      <AnimatePresence>
        {totalQty > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed bottom-6 left-4 right-4 z-50 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <button
                onClick={() => navigate("/cart")}
                className="w-full rounded-[20px] bg-neon-orange text-black font-extrabold px-6 py-4 flex items-center justify-between gap-3 shadow-[0_10px_40px_rgba(249,115,22,0.4)] border border-white/20 transition-transform active:scale-95"
              >
                <span className="text-sm sm:text-base drop-shadow-sm tracking-wide">
                  🛒 {totalQty} item{totalQty > 1 ? "s" : ""} added
                </span>
                <span className="text-sm sm:text-base tracking-wider">
                  View Cart • ₹{totalAmount} →
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
