// src/context/CartContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

const WA_NUMBER = "18091234567"; // 👈 CAMBIA ESTE NÚMERO

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  const checkoutWhatsApp = useCallback(() => {
    if (items.length === 0) return;
    const lista = items
      .map((i) => `• ${i.name} x${i.qty} = RD$${(Number(i.price) * i.qty).toLocaleString("es-DO")}`)
      .join("\n");
    const msg = encodeURIComponent(
      `Hola, quiero realizar el siguiente pedido:\n\n${lista}\n\n*Total: RD$${total.toLocaleString("es-DO")}*\n\n¿Está disponible?`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
  }, [items, total]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count, isOpen, setIsOpen, checkoutWhatsApp }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
