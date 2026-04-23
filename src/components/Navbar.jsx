// src/components/Navbar.jsx
import { ShoppingBag, ShoppingCart, Search, X } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Navbar({ search, onSearch }) {
  const { count, setIsOpen } = useCart();

  return (
    <header className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="bg-violet-600 p-2 rounded-lg shadow-lg shadow-violet-900/40">
            <ShoppingBag size={18} className="text-white" />
          </div>
          <span className="hidden sm:block font-bold text-white text-base tracking-tight">
            Tech<span className="text-violet-400">Vitrina</span>
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar producto, marca…"
            className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl pl-9 pr-9 py-2 text-sm text-white outline-none transition-colors placeholder:text-zinc-600"
          />
          {search && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X size={13} className="text-zinc-500 hover:text-white" />
            </button>
          )}
        </div>

        {/* Cart button */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex-shrink-0 relative p-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-violet-600 text-white rounded-xl transition-all"
          title="Ver carrito"
        >
          <ShoppingCart size={18} />
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-violet-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-violet-900/50 animate-bounce">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
