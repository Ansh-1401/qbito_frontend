import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    revenueTimeline: [],
    topRestaurants: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/superadmin/analytics`)
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const cards = [
    {
      label: "Gross Revenue",
      value: `₹${stats.totalRevenue.toFixed(0)}`,
      icon: "💰",
      color: "from-green-500/20 to-emerald-500/10",
      border: "border-green-500/30",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: "📦",
      color: "from-orange-500/20 to-amber-500/10",
      border: "border-orange-500/30",
    },
    {
      label: "Restaurants",
      value: stats.totalRestaurants,
      icon: "🏪",
      color: "from-blue-500/20 to-cyan-500/10",
      border: "border-blue-500/30",
    },
    {
      label: "Platform Users",
      value: stats.totalUsers,
      icon: "👥",
      color: "from-purple-500/20 to-fuchsia-500/10",
      border: "border-purple-500/30",
    },
  ];

  if (loading) {
    return <div className="animate-pulse text-gray-400 font-bold p-10">Aggregating Data...</div>;
  }

  return (
    <div className="pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Analytics Overview</h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time financial and operational metrics.
          </p>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-2xl border ${card.border} bg-gradient-to-br ${card.color} p-6 relative overflow-hidden backdrop-blur-sm`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-400">{card.label}</p>
                <p className="mt-1 text-3xl font-extrabold text-white">{card.value}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner">
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        
        {/* REVENUE CHART */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0B0F19] p-6 shadow-xl"
        >
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Revenue Timeline
            </h3>
            <span className="text-xs bg-white/5 px-3 py-1 rounded-full border border-white/10 text-gray-400">All Time via Razorpay</span>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* RESTAURANTS BAR CHART */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 bg-[#0B0F19] p-6 shadow-xl flex flex-col"
        >
          <h3 className="text-lg font-bold text-white mb-6">Top Performers</h3>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topRestaurants} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff00" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="orders" fill="#f97316" radius={[0, 4, 4, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
