import { createContext, useContext, useMemo, useState } from "react";
import { checkoutItems } from "./mockData.js";

const CartContext = createContext(null);

// An item is selected unless it has been explicitly unchecked.
const isChecked = (i) => i.checked !== false;

export function CartProvider({ children }) {
  const [items, setItems] = useState(checkoutItems);

  const value = useMemo(() => {
    const selected = items.filter(isChecked);
    const count = items.reduce((s, i) => s + i.qty, 0);
    const selectedCount = selected.reduce((s, i) => s + i.qty, 0);
    const selectedTotal = selected.reduce((s, i) => s + i.price * i.qty, 0);
    const allSelected = items.length > 0 && items.every(isChecked);

    // Adding the same product again raises its quantity instead of adding a new line.
    const add = (item) =>
      setItems((prev) => {
        const found = prev.find((i) => i.id === item.id);
        if (found) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1, checked: true } : i));
        return [...prev, { ...item, qty: 1, checked: true }];
      });

    const setQty = (id, qty) =>
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i)));

    const toggleSelected = (id) =>
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !isChecked(i) } : i)));

    const setAllSelected = (on) => setItems((prev) => prev.map((i) => ({ ...i, checked: on })));

    const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
    const removeSelected = () => setItems((prev) => prev.filter((i) => !isChecked(i)));
    const clear = () => setItems([]);
    const buyNow = (item) => setItems([{ ...item, qty: 1, checked: true }]);

    return {
      items, count, allSelected,
      selected, selectedCount, selectedTotal,
      add, setQty, remove, removeSelected, clear, buyNow,
      toggleSelected, setAllSelected, isChecked,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
