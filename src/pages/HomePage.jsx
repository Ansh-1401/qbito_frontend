import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import axios from "axios";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { totalQty } = useCart();
  const [restaurantsData, setRestaurantsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/restaurants`)
      .then(res => {
        const mapped = res.data.map(r => ({
          ...r,
          image: r.cover,
          tagline: r.tags,
          time: r.eta,
          price: "₹" + r.avgPrice + " for one"
        }));
        setRestaurantsData(mapped);
      })
      .catch(err => console.error("Error fetching restaurants:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-x-hidden relative scroll-smooth">
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 opacity-50 overflow-hidden z-0">
        <motion.div
          className="absolute -top-32 -left-20 h-[500px] w-[500px] rounded-full bg-orange-600/20 blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-purple-900/30 blur-[130px]"
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[150px]"
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Navbar (Sticky) */}
      <nav className="sticky top-0 z-50 w-full bg-[#0B0F19]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-2xl drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">🔥</span>
            <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              QBito
            </span>
          </div>
          
          <div className="flex items-center gap-5">
            {/* Cart Icon */}
            <button 
              onClick={() => navigate("/cart")}
              className="relative p-2 rounded-full hover:bg-white/10 transition flex items-center justify-center text-gray-300 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {totalQty > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neon-orange text-[10px] font-bold text-black border-2 border-[#0B0F19]">
                  {totalQty}
                </span>
              )}
            </button>

            {/* Profile / Auth */}
            {user ? (
              <div className="relative group">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 p-[2px] cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                  <div className="h-full w-full rounded-full bg-[#0B0F19] flex items-center justify-center font-bold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0B0F19]/90 backdrop-blur-xl border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all origin-top-right transform scale-95 group-hover:scale-100">
                  <div className="p-4 border-b border-white/5">
                    <p className="text-sm font-bold truncate text-white">{user.username}</p>
                    <p className="text-[10px] text-gray-400 font-semibold tracking-wider mt-0.5">{user.role}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => navigate(user.role === "SUPER_ADMIN" ? "/super-admin" : user.role === "RESTAURANT_ADMIN" ? "/admin" : "/my-orders")}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition"
                    >
                      {user.role === "CUSTOMER" ? "My Orders" : "Dashboard"}
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-400/10 transition mt-1"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login?signup=true")}
                className="text-sm font-bold px-5 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <div className="py-20 lg:py-32 flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-bold tracking-widest text-orange-400 uppercase mb-6 mx-auto lg:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              The Future of Dining
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-xl">
              Scan.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400">Order.</span><br />
              Enjoy.
            </h1>
            
            <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
              Skip the queue. No physical menus, no waiting for waiters. Simply point your camera, order, and pay seamlessly from your phone.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={() => document.getElementById("restaurants-grid").scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-neon-orange text-black font-extrabold text-lg shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] hover:scale-105 transition-all"
              >
                Explore Tables
              </button>
              <button 
                onClick={() => navigate("/admin/qr")}
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 bg-white/5 text-white font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-md"
              >
                For Restaurants
              </button>
            </div>
          </motion.div>

          {/* Animated Mockup Graphic */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 relative w-full max-w-md mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-purple-500/20 rounded-[3rem] filter blur-3xl"></div>
            <motion.div 
              animate={{ y: [-10, 10, -10] }} 
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl flex flex-col items-center justify-center aspect-[4/5]"
            >
              <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full border border-white/10 bg-gradient-to-br from-[#0B0F19] to-white/5 shadow-xl flex items-center justify-center backdrop-blur-xl">
                <span className="text-3xl">🍔</span>
              </div>
              
              <div className="h-48 w-48 rounded-3xl bg-white p-4 shadow-xl mb-8 relative">
                <div className="absolute inset-0 border-4 border-orange-500/50 rounded-3xl animate-pulse"></div>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=qbito`} alt="QR Demo" className="w-full h-full object-contain opacity-90" />
              </div>
              <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">Scan QR Code</p>
              <p className="text-sm text-gray-500 mt-2">Placed on your table</p>
            </motion.div>
          </motion.div>
        </div>

        {/* RESTAURANTS (Connected Integrations) */}
        <div id="restaurants-grid" className="py-20 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Featured Restaurants</h2>
              <p className="mt-3 text-gray-400">Discover places active on QBito</p>
            </div>
            <div className="text-sm px-4 py-2 rounded-full border border-white/10 text-gray-400 bg-white/5">
              {restaurantsData.length} active locations
            </div>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center text-gray-500 animate-pulse font-bold tracking-widest text-sm uppercase">Loading places...</div>
          ) : restaurantsData.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-gray-300">
              No restaurants found. Try different keywords.
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {restaurantsData.map((r) => (
                <motion.div
                  key={r.id}
                  variants={item}
                  onClick={() => navigate(`/restro/${r.slug}`)}
                  className="group cursor-pointer rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md overflow-hidden hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all duration-300 flex flex-col"
                >
                  <div className="h-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                    <img
                      src={r.image}
                      alt={r.name}
                      className="h-full w-full object-cover transform group-hover:scale-110 transition duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-extrabold text-amber-400 flex items-center gap-1 shadow-lg">
                      ⭐ {r.rating}
                    </div>
                  </div>

                  <div className="p-6 pt-4 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-1 tracking-tight group-hover:text-orange-400 transition-colors">{r.name}</h3>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4 line-clamp-1">{r.category} • {r.address}</p>
                    
                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                       <span className="text-sm font-bold text-gray-300">{r.price}</span>
                       <button className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-black transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* HOW IT WORKS */}
        <div className="py-20 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How it works</h2>
            <p className="mt-3 text-gray-400">Three simple steps to your meal</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0 -translate-y-1/2 -z-10"></div>
            
            {[
              { icon: "📱", title: "Scan Code", desc: "Open your camera and scan the QR placed firmly on your dining table." },
              { icon: "🍕", title: "Order Food", desc: "Browse a rich digital menu and add your favorite cravings to the cart." },
              { icon: "💳", title: "Pay & Enjoy", desc: "Complete testing payment seamlessly. The kitchen gets instantly notified!" }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -5 }}
                className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl p-8 text-center shadow-lg group"
              >
                <div className="h-16 w-16 mx-auto rounded-2xl bg-[#0B0F19] border border-white/10 shadow-inner flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <div className="py-20 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Real-time Tracking", emoji: "⏱️" },
                { label: "Secure Payments", emoji: "🔒" },
                { label: "Digital Receipts", emoji: "🧾" },
                { label: "No App Required", emoji: "🌐" }
              ].map((f, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm p-6 text-center hover:bg-white/10 transition">
                  <span className="text-3xl block mb-3">{f.emoji}</span>
                  <span className="text-sm font-bold text-gray-200">{f.label}</span>
                </div>
              ))}
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Designed for speed.<br/>Built for comfort.
              </h2>
              <p className="mt-4 text-gray-400 leading-relaxed max-w-md mx-auto lg:mx-0">
                Revolutionizing the dining experience by bridging the gap between kitchen and table. Say goodbye to catching waiters' attention.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0B0F19] py-8 text-center text-sm font-medium text-gray-500 relative z-10">
        © {new Date().getFullYear()} QBito Technologies. All rights reserved.
      </footer>

      {/* Floating Cart (Visible anywhere on Homepage if items exist) */}
      <AnimatePresence>
        {totalQty > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button 
              onClick={() => navigate("/cart")}
              className="px-6 py-4 rounded-full bg-neon-orange text-black font-extrabold text-sm shadow-[0_10px_40px_rgba(249,115,22,0.4)] hover:shadow-[0_10px_50px_rgba(249,115,22,0.6)] flex items-center gap-3 transition-transform hover:-translate-y-1"
            >
              <span>🛒</span>
              <span>Checkout ({totalQty})</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
