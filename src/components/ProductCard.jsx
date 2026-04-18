// src/components/ProductCard.jsx
import { Package, MessageCircle } from "lucide-react";

const WA_NUMBER = "18091234567"; // 👈 CAMBIA ESTE NÚMERO

export default function ProductCard({ product, onClick }) {
  const inStock = Number(product.stock) > 0;

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `Hola, me interesa el ${product.name} con precio RD$${Number(product.price).toLocaleString("es-DO")}`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, "_blank");
  };

  return (
    <div
      onClick={onClick}
      className="group bg-zinc-900 border border-zinc-800 hover:border-violet-700/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-violet-900/20 hover:-translate-y-0.5 flex flex-col"
    >
      {/* Image */}
      <div className="relative bg-zinc-800 h-44 overflow-hidden flex-shrink-0">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={36} className="text-zinc-700" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm
            ${inStock
              ? "bg-emerald-900/80 text-emerald-300 border border-emerald-800/60"
              : "bg-red-900/80 text-red-300 border border-red-800/60"
            }`}
          >
            {inStock ? "En stock" : "Agotado"}
          </span>
        </div>

        {product.condition && (
          <div className="absolute top-2 right-2">
            <span className={`text-xs px-2 py-0.5 rounded-full backdrop-blur-sm
              ${product.condition === "Nuevo"
                ? "bg-blue-900/80 text-blue-300 border border-blue-800/60"
                : "bg-amber-900/80 text-amber-300 border border-amber-800/60"
              }`}
            >
              {product.condition}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-zinc-500 text-xs">{product.brand} · {product.category}</p>
        <h3 className="text-white text-sm font-medium mt-1 leading-snug line-clamp-2 flex-1">
          {product.name}
        </h3>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-violet-400 font-bold text-base">
            RD$ {Number(product.price).toLocaleString("es-DO")}
          </p>
          {inStock && (
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
              title="Contactar por WhatsApp"
            >
              <MessageCircle size={12} />
              WA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
