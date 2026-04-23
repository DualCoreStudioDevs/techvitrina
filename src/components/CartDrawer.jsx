// src/components/CartDrawer.jsx
import { X, Plus, Minus, Trash2, ShoppingCart, MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, total, clearCart, checkoutWhatsApp } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col shadow-2xl shadow-black/50"
        style={{ animation: "slideIn 0.25s ease" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-shrink-0">
          <h2 className="font-bold text-white flex items-center gap-2">
            <ShoppingCart size={18} className="text-violet-400" />
            Carrito
            {items.length > 0 && (
              <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full font-normal">
                {items.length}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-zinc-500 hover:text-rose-400 text-xs transition-colors"
              >
                Vaciar
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <ShoppingBag size={52} className="text-zinc-800" />
              <p className="text-zinc-400 font-medium">Tu carrito está vacío</p>
              <p className="text-zinc-600 text-sm">Agrega productos del catálogo</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-violet-400 hover:text-violet-300 text-sm underline"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-800/60 px-4">
              {items.map((item) => (
                <li key={item.id} className="py-4 flex gap-3 group">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-zinc-800 flex-shrink-0 overflow-hidden border border-zinc-700/50">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        📱
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.name}</p>
                    <p className="text-zinc-500 text-xs">{item.brand}</p>
                    <p className="text-violet-400 font-bold text-sm mt-1">
                      RD$ {(Number(item.price) * item.qty).toLocaleString("es-DO")}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-6 h-6 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center transition-colors"
                      >
                        <Minus size={10} className="text-zinc-400" />
                      </button>
                      <span className="text-white text-sm w-4 text-center font-medium">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-6 h-6 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center transition-colors"
                      >
                        <Plus size={10} className="text-zinc-400" />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-900/20 rounded-lg transition-all self-start flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-800 p-5 space-y-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Total estimado</span>
              <span className="text-white font-black text-xl">
                RD$ {total.toLocaleString("es-DO")}
              </span>
            </div>

            <button
              onClick={checkoutWhatsApp}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-900/30"
            >
              <MessageCircle size={18} />
              Finalizar por WhatsApp
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 rounded-xl text-sm transition-all"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
