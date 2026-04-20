// src/components/SalesDashboard.jsx
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  TrendingUp, ShoppingCart, Award, Printer,
  ChevronDown, ChevronUp, Clock,
} from "lucide-react";
import { useVentas } from "../hooks/useVentas";
import Receipt from "./Receipt";

// ── Tooltip personalizado para el gráfico ─────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="text-violet-400 font-semibold">
        RD$ {Number(payload[0].value).toLocaleString("es-DO")}
      </p>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start gap-4">
      <div className={`p-3 rounded-lg flex-shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-zinc-400 text-xs uppercase tracking-wider">{label}</p>
        <p className="text-white text-xl font-bold mt-0.5 truncate">{value}</p>
        {sub && <p className="text-zinc-500 text-xs mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function SalesDashboard() {
  const { ventas, loading, statsDelMes } = useVentas();
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [showAll,        setShowAll]       = useState(false);

  const { totalVentas, numTransacciones, masVendido, porDia } = statsDelMes();

  const mesNombre = new Date().toLocaleDateString("es-DO", { month: "long", year: "numeric" });
  const ventasVis = showAll ? ventas : ventas.slice(0, 8);

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-sm">
        Cargando estadísticas…
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={TrendingUp}
          label={`Ventas — ${mesNombre}`}
          value={`RD$ ${totalVentas.toLocaleString("es-DO")}`}
          sub={`${numTransacciones} transacción${numTransacciones !== 1 ? "es" : ""}`}
          color="bg-violet-600"
        />
        <StatCard
          icon={ShoppingCart}
          label="Transacciones del mes"
          value={numTransacciones}
          color="bg-emerald-700"
        />
        <StatCard
          icon={Award}
          label="Producto más vendido"
          value={masVendido ? masVendido[0] : "—"}
          sub={masVendido ? `${masVendido[1]} unidad${masVendido[1] !== 1 ? "es" : ""}` : "Sin ventas aún"}
          color="bg-amber-700"
        />
      </div>

      {/* ── Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="font-semibold text-white">Ventas — últimos 7 días</h3>
        </div>
        <div className="p-4 h-52">
          {porDia.every((d) => d.total === 0) ? (
            <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
              No hay ventas en los últimos 7 días
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porDia} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139,92,246,0.08)" }} />
                <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Sales history table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Clock size={15} className="text-zinc-400" />
            Historial de ventas
            <span className="text-xs font-normal text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full ml-1">
              {ventas.length}
            </span>
          </h3>
        </div>

        {ventas.length === 0 ? (
          <div className="p-10 text-center text-zinc-600 text-sm">
            Aún no hay ventas registradas.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-medium">Producto</th>
                    <th className="text-center px-4 py-3 font-medium hidden sm:table-cell">Cant.</th>
                    <th className="text-right px-4 py-3 font-medium">Total</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Fecha</th>
                    <th className="text-center px-4 py-3 font-medium">Recibo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {ventasVis.map((v) => {
                    const fecha = v.fecha?.toDate
                      ? v.fecha.toDate()
                      : new Date();
                    const fechaStr = fecha.toLocaleDateString("es-DO", {
                      day: "2-digit", month: "short", year: "numeric",
                    });
                    return (
                      <tr key={v.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-3">
                          <p className="text-white font-medium truncate max-w-[160px]">
                            {v.productoNombre}
                          </p>
                          <p className="text-zinc-500 text-xs">{v.marca}</p>
                        </td>
                        <td className="px-4 py-3 text-center text-zinc-400 hidden sm:table-cell">
                          {v.cantidad}
                        </td>
                        <td className="px-4 py-3 text-right text-violet-400 font-semibold whitespace-nowrap">
                          RD$ {Number(v.precioTotal).toLocaleString("es-DO")}
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-xs hidden md:table-cell whitespace-nowrap">
                          {fechaStr}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedVenta(v)}
                            className="p-1.5 text-zinc-400 hover:text-violet-400 hover:bg-violet-900/30 rounded-lg transition-all"
                            title="Ver recibo"
                          >
                            <Printer size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {ventas.length > 8 && (
              <div className="px-6 py-3 border-t border-zinc-800">
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="text-zinc-400 hover:text-white text-sm flex items-center gap-1 mx-auto transition-colors"
                >
                  {showAll
                    ? <><ChevronUp size={14} /> Ver menos</>
                    : <><ChevronDown size={14} /> Ver todas ({ventas.length})</>
                  }
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Receipt modal */}
      {selectedVenta && (
        <Receipt venta={selectedVenta} onClose={() => setSelectedVenta(null)} />
      )}
    </div>
  );
}
