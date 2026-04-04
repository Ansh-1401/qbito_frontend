import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../config/api";

const emptyUser = {
  username: "",
  email: "",
  password: "",
  role: "RESTAURANT_ADMIN",
  restaurantId: "",
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState(emptyUser);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    api
      .get(`/superadmin/users`)
      .then((res) => setUsers(res.data))
      .catch(console.error);
    api
      .get(`/superadmin/restaurants`)
      .then((res) => setRestaurants(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    const payload = {
      ...form,
      restaurantId: form.restaurantId || null,
    };
    if (editing) {
      await api.put(
        `/superadmin/users/${editing}`,
        payload
      );
    } else {
      await api.post(`/superadmin/users`, payload);
    }
    setForm(emptyUser);
    setEditing(null);
    setShowForm(false);
    load();
  };

  const handleEdit = (u) => {
    setForm({ ...u, password: "" });
    setEditing(u.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    await api.delete(`/superadmin/users/${id}`);
    load();
  };

  const roleBadge = (role) => {
    const map = {
      SUPER_ADMIN: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      RESTAURANT_ADMIN: "bg-blue-500/15 text-blue-300 border-blue-500/30",
      CUSTOMER: "bg-green-500/15 text-green-300 border-green-500/30",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
          map[role] || "bg-gray-500/15 text-gray-300"
        }`}
      >
        {role}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Manage Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} users</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyUser);
            setEditing(null);
            setShowForm(!showForm);
          }}
          className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-sm hover:bg-purple-500/30 transition"
        >
          {showForm ? "✕ Close" : "+ Add User"}
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 overflow-hidden"
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="w-full rounded-lg px-3 py-2 bg-white/5 border border-white/10 outline-none focus:border-purple-500/50 transition text-sm"
                  disabled={!!editing}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 bg-white/5 border border-white/10 outline-none focus:border-purple-500/50 transition text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">
                  Password {editing && "(leave blank to keep)"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full rounded-lg px-3 py-2 bg-white/5 border border-white/10 outline-none focus:border-purple-500/50 transition text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 bg-white/5 border border-white/10 outline-none focus:border-purple-500/50 transition text-sm"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="RESTAURANT_ADMIN">RESTAURANT_ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
              {(form.role === "RESTAURANT_ADMIN") && (
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">
                    Assign Restaurant
                  </label>
                  <select
                    value={form.restaurantId || ""}
                    onChange={(e) =>
                      setForm({ ...form, restaurantId: e.target.value })
                    }
                    className="w-full rounded-lg px-3 py-2 bg-white/5 border border-white/10 outline-none focus:border-purple-500/50 transition text-sm"
                  >
                    <option value="">None</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (ID: {r.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              className="mt-4 px-6 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm hover:bg-purple-600 transition"
            >
              {editing ? "Update User" : "Create User"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="mt-5 rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left font-bold">ID</th>
              <th className="px-4 py-3 text-left font-bold">Username</th>
              <th className="px-4 py-3 text-left font-bold">Email</th>
              <th className="px-4 py-3 text-left font-bold">Role</th>
              <th className="px-4 py-3 text-left font-bold">Restaurant</th>
              <th className="px-4 py-3 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition">
                <td className="px-4 py-3 text-gray-500">#{u.id}</td>
                <td className="px-4 py-3 font-semibold">{u.username}</td>
                <td className="px-4 py-3 text-gray-400">{u.email || "—"}</td>
                <td className="px-4 py-3">{roleBadge(u.role)}</td>
                <td className="px-4 py-3 text-gray-400">
                  {u.restaurantId
                    ? restaurants.find((r) => r.id === u.restaurantId)?.name ||
                      `#${u.restaurantId}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(u)}
                    className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-bold hover:bg-blue-500/20 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="px-3 py-1 rounded-lg bg-red-500/10 text-red-300 text-xs font-bold hover:bg-red-500/20 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
