// src/admin/RestaurantsAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const emptyForm = {
  name: "",
  slug: "",
  place: "",
  tags: "",
  avgPrice: "200",
  category: "Indian",
  rating: "4.5",
  eta: "20-30 min",

  address: "",
  openTime: "10:00 AM - 11:00 PM",
  cover:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=80",
};

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function RestaurantsAdmin() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/restaurants`)
      .then(res => setRestaurants(res.data))
      .catch(err => console.error(err));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((r) =>
      `${r.name} ${r.slug} ${r.place} ${r.tags} ${r.category}`.toLowerCase().includes(q)
    );
  }, [restaurants, search]);

  const onChange = (key, val) => {
    setForm((p) => {
      const next = { ...p, [key]: val };
      if (key === "name" && !editingId) next.slug = slugify(val);
      return next;
    });
  };

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const name = form.name.trim();
    if (!name) return alert("Restaurant name is required");

    const slug = slugify(form.slug || name);

    const payload = {
      name,
      slug,
      place: form.place.trim(),
      tags: form.tags.trim(),
      avgPrice: Number(form.avgPrice || 0),
      category: form.category.trim(),
      rating: Number(form.rating || 0),
      eta: form.eta.trim(),

      address: form.address.trim(),
      openTime: form.openTime.trim(),
      cover: form.cover.trim(),
    };

    if (!editingId) {
      const restro = {
        id: uid(),
        ...payload,
        createdAt: new Date().toISOString(),
      };

      const list = addRestaurant(restro);
      setRestaurants(list);
      reset();
      return;
    }

    const list = updateRestaurant(editingId, payload);
    setRestaurants(list);
    reset();
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setForm({
      name: r.name || "",
      slug: r.slug || "",
      place: r.place || "",
      tags: r.tags || "",
      avgPrice: String(r.avgPrice ?? "200"),
      category: r.category || "Indian",
      rating: String(r.rating ?? "4.5"),
      eta: r.eta || "20-30 min",

      address: r.address || "",
      openTime: r.openTime || "",
      cover: r.cover || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = (id) => {
    const ok = confirm("Delete restaurant? (Menu will also be deleted)");
    if (!ok) return;
    const list = deleteRestaurant(id);
    setRestaurants(list);
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">
              {editingId ? "Edit Restaurant" : "Add Restaurant"}
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              Fill details like Name, Place, Items (tags), etc.
            </p>
          </div>

          {editingId && (
            <button
              onClick={reset}
              className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15 transition"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid lg:grid-cols-2 gap-4">
          {/* Left */}
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-bold mb-3">Restaurant Info</p>

            <div className="grid gap-3">
              <input
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="Restaurant Name (ex: Pizza Plaza)"
                className="w-full rounded-2xl px-4 py-3 bg-white/10 border border-white/10 outline-none"
              />

              <input
                value={form.slug}
                onChange={(e) => onChange("slug", e.target.value)}
                placeholder="Slug (ex: pizza-plaza)"
                className="w-full rounded-2xl px-4 py-3 bg-white/10 border border-white/10 outline-none"
              />

              <input
                value={form.place}
                onChange={(e) => onChange("place", e.target.value)}
                placeholder="Place (ex: Digiha, Bahraich)"
                className="w-full rounded-2xl px-4 py-3 bg-white/10 border border-white/10 outline-none"
              />

              <input
                value={form.tags}
                onChange={(e) => onChange("tags", e.target.value)}
                placeholder="Items/Tags (ex: Burgers • Pizza • Shakes)"
                className="w-full rounded-2xl px-4 py-3 bg-white/10 border border-white/10 outline-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.rating}
                  onChange={(e) => onChange("rating", e.target.value)}
                  placeholder="Rating (ex: 4.6)"
                  className="w-full rounded-2xl px-4 py-3 bg-white/10 border border-white/10 outline-none"
                />

                <input
                  value={form.eta}
                  onChange={(e) => onChange("eta", e.target.value)}
                  placeholder="ETA (ex: 20-30 min)"
                  className="w-full rounded-2xl px-4 py-3 bg-white/10 border border-white/10 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.avgPrice}
                  onChange={(e) => onChange("avgPrice", e.target.value)}
                  placeholder="Avg Price (₹200)"
                  className="w-full rounded-2xl px-4 py-3 bg-white/10 border border-white/10 outline-none"
                />

                <input
                  value={form.category}
                  onChange={(e) => onChange("category", e.target.value)}
                  placeholder="Category (Pizza/Indian/South)"
                  className="w-full rounded-2xl px-4 py-3 bg-white/10 border border-white/10 outline-none"
                />
              </div>

              <input
                value={form.address}
                onChange={(e) => onChange("address", e.target.value)}
                placeholder="Full Address (optional)"
                className="w-full rounded-2xl px-4 py-3 bg-white/10 border border-white/10 outline-none"
              />

              <input
                value={form.openTime}
                onChange={(e) => onChange("openTime", e.target.value)}
                placeholder="Open Time (ex: 10AM - 11PM)"
                className="w-full rounded-2xl px-4 py-3 bg-white/10 border border-white/10 outline-none"
              />
            </div>
          </div>

          {/* Right */}
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-bold mb-3">Cover</p>

            <div className="grid gap-3">
              <input
                value={form.cover}
                onChange={(e) => onChange("cover", e.target.value)}
                placeholder="Cover Image URL"
                className="w-full rounded-2xl px-4 py-3 bg-white/10 border border-white/10 outline-none"
              />

              <img
                src={form.cover}
                alt="cover preview"
                className="rounded-3xl border border-white/10 h-[200px] w-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-wrap gap-3">
            <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-black font-extrabold hover:opacity-95 transition">
              {editingId ? "Update Restaurant" : "+ Add Restaurant"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/qr")}
              className="px-6 py-3 rounded-2xl bg-white/10 border border-white/10 text-white font-semibold hover:bg-white/15 transition"
            >
              Open QR Generator
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold">Restaurants</h3>
            <p className="text-sm text-gray-300 mt-1">{restaurants.length} total</p>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants..."
            className="w-full sm:w-[320px] rounded-2xl px-4 py-3 bg-white/10 border border-white/10 outline-none"
          />
        </div>

        <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-3xl border border-white/10 bg-black/20 overflow-hidden"
            >
              <img src={r.cover} alt={r.name} className="h-40 w-full object-cover opacity-95" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-extrabold">{r.name}</h4>
                    <p className="text-sm text-gray-300">{r.place}</p>
                    <p className="text-xs text-gray-400 mt-2">{r.tags}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold">⭐ {r.rating || 0}</p>
                    <p className="text-xs text-gray-300 mt-1">{r.eta}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-gray-200">
                  <span>₹{r.avgPrice || 0} for one</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10">
                    {r.category || "Category"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/admin/restaurants/${r.id}/menu`)}
                    className="px-4 py-2 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition"
                  >
                    Manage Menu →
                  </button>
                  <button
                    onClick={() => startEdit(r)}
                    className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(r.id)}
                    className="px-4 py-2 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 hover:bg-red-500/20 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 rounded-3xl border border-white/10 bg-black/20 p-8 text-center text-gray-300">
              No restaurants found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
