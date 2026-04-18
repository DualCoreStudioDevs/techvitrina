// src/components/ProductModal.jsx
import { useState, useEffect } from "react";
import {
  X, MessageCircle, Package, Tag, Layers,
  Calculator, ChevronDown, ChevronUp
} from "lucide-react";

const WA_NUMBER = "18091234567"; // 👈 CAMBIA ESTE NÚMERO

const PLANS = [
  { months: 3,  rate: 0 },
  { months: 6,  rate: 3 },
  { months: 12, rate: 5 },
  { months: 24, rate: 8 },
];

export default function ProductModal({ product, onClose }) {
  const [showCalc, setShowCalc]     = useState(false);
  const [planIdx,  setPlanIdx]      = useState(0);
  const [downPct,  setDownPct]      = useState(20);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const price      = Number(product.price);
  const downAmount = Math.round(price * downPct / 100);
  const financed   = price - downAmount;
  const plan       = PLANS[planIdx];
  const monthly    = plan.months === 0 ? 0 :
    Math.round(financed * (1 + plan.rate / 100) / plan.months);
  const totalPay   = downAmount + monthly * plan.months;

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hola, me interesa el ${product.name} con precio RD$${price.toLocaleString("es-DO")}. ¿Está disponible?`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, "_blank");
  };

  const inStock = Number(product.stock) > 0;

  return (
    <div
      className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto sm:hidden absolute left-1/2 -translate-x-1/2 -top-0 mt-2" />
          <h2 className="font-semibold text-white text-sm truncate pr-4 flex-1">
            {product.name}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 hover:bg-zinc-800 rounded-lg transition-all flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Image */}
          <div className="bg-zinc-800 rounded-xl overflow-hidden h-56 flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={48} className="text-zinc-700" />
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-medium px-3 py-1 rounded-full border
              ${inStock ? "bg-emerald-900/40 text-emerald-400 border-emerald-800/50" : "bg-red-900/40 text-red-400 border-red-800/50"}`}>
              {inStock ? `✓ En stock (${product.stock} disponibles)` : "✗ Agotado"}
            </span>
            {product.condition && (
              <span className={`text-xs px-3 py-1 rounded-full border
                ${product.condition === "Nuevo" ? "bg-blue-900/40 text-blue-400 border-blue-800/50" : "bg-amber-900/40 text-amber-400 border-amber-800/50"}`}>
                {product.condition}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2.5">
            <DetailRow icon={Tag}    label="Marca"     value={product.brand || "—"} />
            <DetailRow icon={Layers} label="Categoría" value={product.category || "—"} />
            {product.description && (
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
                <p className="text-zinc-400 text-xs uppercase tracking-wider mb-2">Descripción</p>
                <p className="text-zinc-300 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Precio</span>
            <span className="text-violet-400 text-2xl font-bold">
              RD$ {price.toLocaleString("es-DO")}
            </span>
          </div>

          {/* ── Calculadora de cuotas */}
          <div className="border border-zinc-700/60 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowCalc(!showCalc)}
              className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800/60 hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Calculator size={15} className="text-violet-400" />
                <span className="text-white text-sm font-medium">Calculadora de cuotas</span>
              </div>
              {showCalc ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
            </button>

            {showCalc && (
              <div className="p-4 space-y-4 bg-zinc-900">
                {/* Plan selector */}
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Plan de financiamiento</p>
                  <div className="grid grid-cols-4 gap-2">
                    {PLANS.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setPlanIdx(i)}
                        className={`py-2 rounded-lg text-xs font-medium border transition-all
                          ${planIdx === i
                            ? "bg-violet-600 border-violet-500 text-white"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                          }`}
                      >
                        {p.months}m
                        {p.rate > 0 && <span className="block text-[10px] opacity-70">+{p.rate}%</span>}
                        {p.rate === 0 && <span className="block text-[10px] opacity-70">0%</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Down payment slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">Inicial</p>
                    <p className="text-white text-xs font-medium">{downPct}% — RD$ {downAmount.toLocaleString("es-DO")}</p>
                  </div>
                  <input
                    type="range" min="0" max="80" step="5"
                    value={downPct}
                    onChange={(e) => setDownPct(Number(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                  <div className="flex justify-between text-zinc-600 text-xs mt-1">
                    <span>0%</span><span>80%</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-zinc-800 rounded-xl p-4 space-y-2.5">
                  <CalcRow label="Precio del equipo"   value={`RD$ ${price.toLocaleString("es-DO")}`} />
                  <CalcRow label="Inicial"             value={`RD$ ${downAmount.toLocaleString("es-DO")}`} />
                  <CalcRow label="Monto a financiar"   value={`RD$ ${financed.toLocaleString("es-DO")}`} />
                  <div className="border-t border-zinc-700 pt-2.5">
                    <CalcRow
                      label={`Cuota mensual × ${plan.months}`}
                      value={`RD$ ${monthly.toLocaleString("es-DO")}`}
                      highlight
                    />
                    <CalcRow
                      label="Total a pagar"
                      value={`RD$ ${totalPay.toLocaleString("es-DO")}`}
                      muted
                    />
                  </div>
                </div>

                <p className="text-zinc-600 text-xs text-center">
                  * Cálculo estimado. Consulta condiciones finales con el vendedor.
                </p>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pb-2">
            <button
              onClick={handleWhatsApp}
              disabled={!inStock}
              className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-colors"
            >
              <MessageCircle size={18} />
              {inStock ? "Contactar por WhatsApp" : "Producto agotado"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/60">
      <div className="flex items-center gap-2 text-zinc-500 text-sm">
        <Icon size={14} /> {label}
      </div>
      <span className="text-zinc-300 text-sm font-medium">{value}</span>
    </div>
  );
}

function CalcRow({ label, value, highlight, muted }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${muted ? "text-zinc-500" : "text-zinc-400"}`}>{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-violet-400" : muted ? "text-zinc-500" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}
