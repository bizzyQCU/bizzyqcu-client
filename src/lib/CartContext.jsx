import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const CartContext = createContext(null);

const isChecked = (i) => i.checked !== false;

function readStoredCart(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const storageKey = user?.id ? `bizzyqcu_cart_${user.id}` : "bizzyqcu_cart_guest";
  const [items, setItems] = useState(() => readStoredCart(storageKey));

  useEffect(() => {
    setItems(readStoredCart(storageKey));
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // ignore storage quota errors
    }
  }, [storageKey, items]);

  const value = useMemo(() => {
    const selected = items.filter(isChecked);
    const getItemQty = (i) => i.qty ?? i.quantity ?? 1;
    const count = items.reduce((s, i) => s + getItemQty(i), 0);
    const selectedCount = selected.reduce((s, i) => s + getItemQty(i), 0);
    const selectedTotal = selected.reduce((s, i) => s + (Number(i.price) || 0) * getItemQty(i), 0);
    const allSelected = items.length > 0 && items.every(isChecked);

    // Adding the same product again raises its quantity instead of adding a new line.
    const add = (item) =>
      setItems((prev) => {
        const itemId = item.id || item.productId;
        const addQty = item.qty ?? item.quantity ?? 1;
        const found = prev.find((i) => (i.id || i.productId) === itemId);
        if (found) {
          const newQty = getItemQty(found) + addQty;
          return prev.map((i) =>
            (i.id || i.productId) === itemId
              ? {
                  ...i,
                  ...item,
                  id: itemId,
                  productId: item.productId || itemId,
                  qty: newQty,
                  quantity: newQty,
                  checked: true,
                }
              : i
          );
        }
        return [
          ...prev,
          {
            ...item,
            id: itemId,
            productId: item.productId || itemId,
            qty: addQty,
            quantity: addQty,
            checked: true,
          },
        ];
      });

    const setQty = (id, qty) =>
      setItems((prev) =>
        prev.map((i) => {
          if ((i.id || i.productId) === id) {
            const clamped = Math.max(1, Math.min(99, qty));
            return { ...i, qty: clamped, quantity: clamped };
          }
          return i;
        })
      );

    const toggleSelected = (id) =>
      setItems((prev) =>
        prev.map((i) =>
          (i.id || i.productId) === id ? { ...i, checked: !isChecked(i) } : i
        )
      );

    const setAllSelected = (on) =>
      setItems((prev) => prev.map((i) => ({ ...i, checked: on })));

    const remove = (id) =>
      setItems((prev) => prev.filter((i) => (i.id || i.productId) !== id));

    const removeSelected = () => setItems((prev) => prev.filter((i) => !isChecked(i)));

    const clearCheckedOut = (checkedOutItems) => {
      if (Array.isArray(checkedOutItems) && checkedOutItems.length > 0) {
        const checkedOutIds = new Set(
          checkedOutItems.flatMap((i) => [i.id, i.productId].filter(Boolean))
        );
        setItems((prev) =>
          prev.filter((i) => !checkedOutIds.has(i.id) && !checkedOutIds.has(i.productId))
        );
      } else {
        removeSelected();
      }
    };

    const clear = () => setItems([]);

    const buyNow = (item) => {
      const itemId = item.id || item.productId;
      const qty = item.qty ?? item.quantity ?? 1;
      setItems([
        {
          ...item,
          id: itemId,
          productId: item.productId || itemId,
          qty,
          quantity: qty,
          checked: true,
        },
      ]);
    };

    return {
      items,
      count,
      allSelected,
      selected,
      selectedCount,
      selectedTotal,
      add,
      setQty,
      remove,
      removeSelected,
      clearCheckedOut,
      clear,
      buyNow,
      toggleSelected,
      setAllSelected,
      isChecked,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
