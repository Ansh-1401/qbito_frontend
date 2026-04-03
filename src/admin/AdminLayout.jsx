import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMemo } from "react";

const linkBase =
  "flex items-center gap-3 px-4 py-3 rounded-2xl border transition font-semibold text-sm";
const linkActive = "bg-white text-black border-white shadow-lg";
const linkIdle =
  "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white";

export default function AdminLayout() {
  const navigate = useNavigate();

  const links = useMemo(
    () => [
      { to: "/admin", label: "Dashboard", icon: "📊" },
      { to: "/admin/orders", label: "Live Orders", icon: "📡" },
      { to: "/admin/restaurants", label: "Restaurants", icon: "🏪" },
      { to: "/admin/qr", label: "QR Generator", icon: "📱" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      {/* Topbar */}
      <div className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-black font-extrabold text-lg shadow-[0_0_16px_rgba(249,115,22,0.3)]">
              S
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold leading-tight">
                QBito
              </p>
              <h1 className="text-lg font-extrabold leading-tight">
                Admin Panel
              </h1>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-semibold hover:bg-white/15 transition"
          >
            ← Customer App
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-[92px] h-fit glass-panel border border-glass-border p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 px-1">
            Navigation
          </p>

          <div className="grid gap-1.5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkIdle}`
                }
                end={l.to === "/admin"}
              >
                <span>{l.icon}</span>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-black/30">
            <p className="text-xs font-bold text-gray-300">💡 Tip</p>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Open "Live Orders" to receive incoming customer orders in
              real-time via WebSocket.
            </p>
          </div>
        </aside>

        {/* Content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
