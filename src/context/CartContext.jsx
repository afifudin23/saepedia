import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { cartApi } from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const EMPTY = { storeId: null, store: null, items: [], subtotal: 0, count: 0 };

export function CartProvider({ children }) {
  const { user, activeRole } = useAuth();
  const [cart, setCart] = useState(EMPTY);

  const isBuyer = !!user && activeRole === "buyer";

  const refresh = useCallback(async () => {
    if (!isBuyer) {
      setCart(EMPTY);
      return EMPTY;
    }
    const c = await cartApi.get(user.id);
    setCart(c);
    return c;
  }, [isBuyer, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = useCallback(
    async (productId, qty = 1) => {
      const c = await cartApi.add(user.id, productId, qty);
      setCart(c);
      return c;
    },
    [user]
  );

  const updateQty = useCallback(
    async (productId, qty) => {
      const c = await cartApi.updateQty(user.id, productId, qty);
      setCart(c);
      return c;
    },
    [user]
  );

  const removeItem = useCallback(
    async (productId) => {
      const c = await cartApi.remove(user.id, productId);
      setCart(c);
      return c;
    },
    [user]
  );

  const clearCart = useCallback(async () => {
    const c = await cartApi.clear(user.id);
    setCart(c);
    return c;
  }, [user]);

  return (
    <CartContext.Provider
      value={{ cart, refresh, addToCart, updateQty, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
