import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "qbito_cart_v1";
const RESTRO_STORAGE_KEY = "qbito_restaurant_v1";

/** ✅ safe JSON parse */
const safeParse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

/** ✅ normalize cart (always array of valid objects) */
const normalizeCart = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x) => x && (x.id || x._id))
    .map((x) => ({
      ...x,
      id: x.id ?? x._id,
      qty: Number(x.qty || 0) > 0 ? Number(x.qty || 0) : 1,
      price: Number(x.price || 0),
    }));
};

/** ✅ debounce hook */
const useDebouncedEffect = (callback, deps, delay = 250) => {
  const timer = useRef(null);

  useEffect(() => {
    timer.current && clearTimeout(timer.current);
    timer.current = setTimeout(() => callback(), delay);

    return () => timer.current && clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export const CartProvider = ({ children }) => {
  // ✅ Load cart safely
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return [];
    return normalizeCart(safeParse(saved, []));
  });

  // ✅ Load restaurant info safely
  const [restaurantInfo, setRestaurantInfoState] = useState(() => {
    const saved = localStorage.getItem(RESTRO_STORAGE_KEY);
    if (!saved) return null;

    const info = safeParse(saved, null);
    if (!info || typeof info !== "object") return null;

    // keep only important fields
    return {
      slug: info.slug ?? null,
      name: info.name ?? "",
      tableNo: info.tableNo ?? null,
      ...info,
    };
  });

  // ✅ prevent multiple clears due to strict mode
  const prevSlugRef = useRef(restaurantInfo?.slug ?? null);

  // ✅ If restaurant changes => clear cart
  useEffect(() => {
    const prevSlug = prevSlugRef.current;
    const newSlug = restaurantInfo?.slug ?? null;

    if (prevSlug && newSlug && prevSlug !== newSlug) {
      setCart([]);
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch {}
    }

    prevSlugRef.current = newSlug;
  }, [restaurantInfo?.slug]);

  // ✅ Persist cart (debounced)
  useDebouncedEffect(
    () => {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch {}
    },
    [cart],
    200
  );

  // ✅ Persist restaurantInfo (debounced)
  useDebouncedEffect(
    () => {
      try {
        localStorage.setItem(
          RESTRO_STORAGE_KEY,
          JSON.stringify(restaurantInfo)
        );
      } catch {}
    },
    [restaurantInfo],
    200
  );

  // ✅ Cart Actions
  const addToCart = (item) => {
    if (!item) return;
    const id = item.id ?? item._id;
    if (!id) return;

    setCart((prev) => {
      const existing = prev.find((x) => x.id === id);
      if (existing) {
        return prev.map((x) =>
          x.id === id ? { ...x, qty: (x.qty || 0) + 1 } : x
        );
      }
      return [
        ...prev,
        {
          ...item,
          id,
          qty: 1,
          price: Number(item.price || 0),
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    if (!id) return;
    setCart((prev) => prev.filter((x) => x.id !== id));
  };

  const increaseQty = (id) => {
    if (!id) return;
    setCart((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty: (x.qty || 0) + 1 } : x))
    );
  };

  const decreaseQty = (id) => {
    if (!id) return;
    setCart((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: (x.qty || 0) - 1 } : x))
        .filter((x) => (x.qty || 0) > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  // ✅ Helpers
  const getQty = (id) => cart.find((x) => x.id === id)?.qty || 0;

  const totalQty = useMemo(
    () => cart.reduce((sum, x) => sum + (x.qty || 0), 0),
    [cart]
  );

  const totalAmount = useMemo(
    () => cart.reduce((sum, x) => sum + (x.qty || 0) * (x.price || 0), 0),
    [cart]
  );

  // ✅ Restaurant setter
  const setRestaurantInfo = (info) => {
    if (!info || typeof info !== "object") return;

    setRestaurantInfoState((prev) => ({
      ...(prev || {}),
      ...info,
      slug: info.slug ?? prev?.slug ?? null,
    }));
  };

  const isSameRestaurant = (slug) => {
    if (!restaurantInfo?.slug) return true;
    return restaurantInfo.slug === slug;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        restaurantInfo,

        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,

        totalQty,
        totalAmount,
        getQty,

        isSameRestaurant,
        setRestaurantInfo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
