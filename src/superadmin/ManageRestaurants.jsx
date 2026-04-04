import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../config/api";

const emptyForm = {
  name: "",
  slug: "",
  place: "",
  tags: "",
  avgPrice: 200,
  category: "Indian",
  rating: 4.5,
  eta: "20-30 min",
  address: "",
  openTime: "10:00 AM - 11:00 PM",
  cover: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=80",
};

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function ManageRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    api
      .get(`/superadmin/restaurants`)
      .then((res) => setRestaurants(res.data))
      .catch(console.error);

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    if (editing) {
      await api.put(
        `/superadmin/restaurants/${editing}`,
        payload
      );
    } else {
      await api.post(`/superadmin/restaurants`, payload);
    }
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
    load();
  };

  const handleEdit = (r) => {
    setForm(r);
    setEditing(r.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this restaurant?")) return;
    await api.delete(`/superadmin/restaurants/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Manage Restaurants</h1>
          <p className="text-gray-500 text-sm mt-1">
            {restaurants.length} restaurants registered
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditing(null);
            setShowForm(!showForm);
          }}
          className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-sm hover:bg-purple-500/30 transition"
        >
          {showForm ? "✕ Close" : "+ Add Restaurant"}
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
              {[
                { key: "name", label: "Name", type: "text" },
                { key: "slug", label: "Slug", type: "text" },
                { key: "place", label: "Place", type: "text" },
                { key: "tags", label: "Tags", type: "text" },
                { key: "category", label: "Category", type: "text" },
                { key: "avgPrice", label: "Avg Price", type: "number" },
                { key: "rating", label: "Rating", type: "number" },
                { key: "eta", label: "ETA", type: "text" },
                { key: "address", label: "Address", type: "text" },
                { key: "openTime", label: "Open Time", type: "text" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={form[f.key] || ""}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                    className="w-full rounded-lg px-3 py-2 bg-white/5 border border-white/10 outline-none focus:border-purple-500/50 transition text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">
                Cover Image Upload
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    
                    const formData = new FormData();
                    formData.append("file", file);
                    
                    try {
                      const res = await axios.post(`${import.meta.env.VITE_API_URL}/media/upload`, formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                      });
                      setForm({ ...form, cover: res.data.url });
                    } catch (err) {
                      console.error("Upload failed", err);
                      alert("Image upload failed");
                    }
                  }}
                  className="flex-1 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 transition cursor-pointer"
                />
                {form.cover && (
                  <img src={form.cover} alt="Preview" className="h-10 w-10 object-cover rounded-md border border-white/10" />
                )}
              </div>
            </div>
            <button
              onClick={handleSave}
              className="mt-4 px-6 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm hover:bg-purple-600 transition"
            >
              {editing ? "Update Restaurant" : "Create Restaurant"}
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
              <th className="px-4 py-3 text-left font-bold">Name</th>
              <th className="px-4 py-3 text-left font-bold">Slug</th>
              <th className="px-4 py-3 text-left font-bold">Category</th>
              <th className="px-4 py-3 text-left font-bold">Rating</th>
              <th className="px-4 py-3 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {restaurants.map((r) => (
              <tr key={r.id} className="hover:bg-white/[0.02] transition">
                <td className="px-4 py-3 text-gray-500">#{r.id}</td>
                <td className="px-4 py-3 font-semibold">{r.name}</td>
                <td className="px-4 py-3 text-gray-400">{r.slug}</td>
                <td className="px-4 py-3 text-gray-400">{r.category}</td>
                <td className="px-4 py-3">
                  <span className="text-yellow-400">★</span> {r.rating}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(r)}
                    className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-bold hover:bg-blue-500/20 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
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
