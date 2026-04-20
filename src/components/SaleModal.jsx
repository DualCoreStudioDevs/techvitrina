// src/components/SaleModal.jsx
import { useState } from "react";
import { X, ShoppingCart, AlertCircle, Minus, Plus } from "lucide-react";

export default function SaleModal({ product, onConfirm, onClose, saving }) {
  const [cantidad, setCantidad] = useState(1);
  const [nota,     setNota]     = useState("");

  const stock     = Number(product.stock);
  const precio    = Number(product.price);
  const total     = precio * cantidad;
  const sinStock  = stock <= 0;

  return (
    <div
      className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <ShoppingCart size={16} className="text-violet-400" />
            Registrar venta
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Producto info */}
          <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 flex gap-3">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-white font-medium truncate">{product.name}</p>
              <p className="text-zinc-400 text-sm">{product.brand} · {product.category}</p>
              <p className="text-violet-400 font-semibold mt-1">
                RD$ {precio.toLocaleString("es-DO")}
              </p>
            </div>
          </div>

          {/* Sin stock warning */}
          {sinStock && (
            <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={14} /> Este producto no tiene stock disponible.
            </div>
          )}

          {/* Cantidad */}
          {!sinStock && (
            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-wider block mb-2">
                Cantidad (stock: {stock})
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCantidad((v) => Math.max(1, v - 1))}
                  className="w-9 h-9 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 hover:border-zinc-500 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-white font-semibold text-lg w-8 text-center">{cantidad}</span>
                <button
                  onClick={() => setCantidad((v) => Math.min(stock, v + 1))}
                  className="w-9 h-9 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 hover:border-zinc-500 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Nota / Garantía */}
          <div>
            <label className="text-zinc-400 text-xs uppercase tracking-wider block mb-2">
              Nota / Garantía (aparecerá en el recibo)
            </label>
            <textarea
              rows={3}
              placeholder="Ej: Garantía de 3 meses, incluye cargador original..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors resize-none placeholder:text-zinc-600"
            />
          </div>

          {/* Total */}
          {!sinStock && (
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Total a cobrar</span>
              <span className="text-violet-400 text-2xl font-bold">
                RD$ {total.toLocaleString("es-DO")}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 rounded-xl text-sm transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={() => !sinStock && onConfirm({ cantidad, nota })}
              disabled={sinStock || saving}
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {saving ? "Registrando..." : "Confirmar venta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
