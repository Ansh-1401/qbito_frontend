import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const emptyItem = {
  name: "",
  price: "",
  category: "Main Course",
  type: "veg",
  description: "",
  image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
};

const API = `${import.meta.env.VITE_API_URL}/admin/menu`;

export default function RestaurantMenuAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/restaurants`)
      .then((res) => {
        const r = res.data.find((r) => String(r.id) === String(id));
        setRestaurant(r || null);
      })
      .catch(() => {});

    axios
      .get(`${API}/${id}`)
      .then((res) => setItems(res.data))
      .catch(() => {});
  }, [id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) =>
      `${x.name} ${x.category} ${x.type}`.toLowerCase().includes(q)
    );
  }, [items, search]);

  const onChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const reset = () => {
    setForm(emptyItem);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Item name required");
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price || 0),
        category: form.category.trim(),
        type: form.type,
        description: form.description.trim(),
        image: form.image.trim(),
      };

      if (editingId) {
        const res = await axios.put(`${API}/item/${editingId}`, payload);
        setItems((prev) =>
          prev.map((i) => (i.id === editingId ? res.data : i))
        );
      } else {
        const res = await axios.post(`${API}/${id}`, payload);
        setItems((prev) => [...prev, res.data]);
      }
      reset();
    } catch (err) {
      console.error(err);
      alert("Failed to save menu item");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      price: String(item.price ?? ""),
      category: item.category || "Main Course",
      type: item.type || "veg",
      description: item.description || "",
      image: item.image || emptyItem.image,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (itemId) => {
    if (!confirm("Delete this menu item?")) return;
    try {
      await axios.delete(`${API}/item/${itemId}`);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  if (!restaurant) {
    return (
      <div className="glass-panel border border-glass-border p-10 text-center text-gray-300">
        <p className="text-4xl mb-4">🔍</p>
        Restaurant not found.
        <div className="mt-4">
          <button
            onClick={() => navigate("/admin/restaurants")}
            className="px-5 py-3 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="glass-panel border border-glass-border p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Menu Management
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {restaurant.name} •{" "}
              <span className="text-gray-300 font-semibold">
                {items.length} items
              </span>
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/restaurants")}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition text-sm font-semibold"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="glass-panel border border-glass-border p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold">
              {editingId ? "✏️ Edit Menu Item" : "➕ Add Menu Item"}
            </h3>
          </div>
          {editingId && (
            <button
              onClick={reset}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition text-sm"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={submit} className="mt-5 grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
              Details
            </p>
            <input
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Item name"
              className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-orange-500/50 transition text-sm"
            />
            <input
              value={form.price}
              onChange={(e) => onChange("price", e.target.value)}
              placeholder="Price (₹)"
              type="number"
              className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-orange-500/50 transition text-sm"
            />
            <input
              value={form.category}
              onChange={(e) => onChange("category", e.target.value)}
              placeholder="Category (Pizza, Drinks, Main Course)"
              className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-orange-500/50 transition text-sm"
            />
            <div className="flex gap-2">
              <select
                value={form.type}
                onChange={(e) => onChange("type", e.target.value)}
                className="flex-1 rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none text-sm"
              >
                <option value="veg">🟢 Veg</option>
                <option value="nonveg">🔴 Non-Veg</option>
              </select>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="Description"
              className="w-full min-h-[80px] rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-orange-500/50 transition text-sm"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
              Item Image Upload
            </p>
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
                  onChange("image", res.data.url);
                } catch (err) {
                  console.error("Upload failed", err);
                  alert("Image upload failed");
                }
              }}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30 transition cursor-pointer"
            />
            <img
              src={form.image}
              alt="preview"
              className="rounded-xl border border-white/10 h-[180px] w-full object-cover mt-2"
            />
          </div>

          <div className="lg:col-span-2">
            <button
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-orange-500 text-black font-extrabold hover:bg-orange-400 transition shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Item"
                : "➕ Add Item"}
            </button>
          </div>
        </form>
      </div>

      {/* Items List */}
      <div className="glass-panel border border-glass-border p-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <h3 className="text-lg font-extrabold">Menu Items</h3>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu..."
            className="w-full sm:w-[280px] rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none text-sm"
          />
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((x) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={x.id}
                className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden hover:border-white/20 transition group"
              >
                <img
                  src={x.image || emptyItem.image}
                  alt={x.name}
                  className="h-36 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold">{x.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        ₹{x.price} • {x.category}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        x.type === "veg"
                          ? "bg-green-500/10 border-green-500/30 text-green-300"
                          : "bg-red-500/10 border-red-500/30 text-red-300"
                      }`}
                    >
                      {x.type}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => startEdit(x)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition text-xs font-bold"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => onDelete(x.id)}
                      className="flex-1 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition text-xs font-bold"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 glass-panel border border-glass-border p-10 text-center text-gray-400">
              <p className="text-3xl mb-3">🍽️</p>
              No menu items found. Add your first dish above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
