import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/super-admin", label: "Dashboard", icon: "📊", end: true },
  { to: "/super-admin/restaurants", label: "Restaurants", icon: "🏪" },
  { to: "/super-admin/users", label: "Users", icon: "👥" },
  { to: "/super-admin/orders", label: "All Orders", icon: "📦" },
];

export default function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-white">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/10 bg-white/[0.02] flex flex-col">
        {/* Brand */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-black font-extrabold shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              S2D
            </div>
            <div>
              <p className="font-extrabold text-sm">QBito</p>
              <p className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">
                Super Admin
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? "bg-purple-500/15 border border-purple-500/30 text-purple-300"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">{user?.username}</p>
              <p className="text-[10px] text-gray-500">👑 {user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/20 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
