// src/admin/adminStorage.js

const RESTRO_KEY = "qbito_admin_restaurants_v1";
const MENU_KEY = "qbito_admin_menus_v1"; // restaurantId => items[]

const safeParse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

export const slugify = (text = "") =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

export function getRestaurants() {
  const raw = localStorage.getItem(RESTRO_KEY);
  const data = safeParse(raw, []);
  return Array.isArray(data) ? data : [];
}

export function saveRestaurants(list) {
  localStorage.setItem(RESTRO_KEY, JSON.stringify(list));
}

export function addRestaurant(restro) {
  const list = getRestaurants();
  list.unshift(restro);
  saveRestaurants(list);
  return list;
}

export function updateRestaurant(id, patch) {
  const list = getRestaurants().map((r) => (r.id === id ? { ...r, ...patch } : r));
  saveRestaurants(list);
  return list;
}

export function deleteRestaurant(id) {
  const list = getRestaurants().filter((r) => r.id !== id);
  saveRestaurants(list);

  // also delete menu
  const menus = getAllMenus();
  delete menus[id];
  saveAllMenus(menus);

  return list;
}

// ---------------------- MENUS ----------------------

export function getAllMenus() {
  const raw = localStorage.getItem(MENU_KEY);
  const data = safeParse(raw, {});
  return data && typeof data === "object" ? data : {};
}

export function saveAllMenus(menusByRestaurant) {
  localStorage.setItem(MENU_KEY, JSON.stringify(menusByRestaurant));
}

export function getMenu(restaurantId) {
  const menus = getAllMenus();
  const list = menus[restaurantId];
  return Array.isArray(list) ? list : [];
}

export function saveMenu(restaurantId, items) {
  const menus = getAllMenus();
  menus[restaurantId] = items;
  saveAllMenus(menus);
}

export function addMenuItem(restaurantId, item) {
  const list = getMenu(restaurantId);
  list.unshift(item);
  saveMenu(restaurantId, list);
  return list;
}

export function updateMenuItem(restaurantId, itemId, patch) {
  const list = getMenu(restaurantId).map((x) => (x.id === itemId ? { ...x, ...patch } : x));
  saveMenu(restaurantId, list);
  return list;
}

export function deleteMenuItem(restaurantId, itemId) {
  const list = getMenu(restaurantId).filter((x) => x.id !== itemId);
  saveMenu(restaurantId, list);
  return list;
}
