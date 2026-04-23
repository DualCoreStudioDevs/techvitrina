// src/components/SalesDashboard.jsx
//
// Dashboard de ventas con:
//  - Botones de período predefinido (Hoy / Semana / Mes / Año)
//  - DatePicker para día exacto o rango manual
//  - KPIs recalculados reactivamente al cambiar la fecha
//  - Tabla de transacciones filtrada
//  - Ticket imprimible
//
import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  TrendingUp, ShoppingCart, Award, Printer,
  ChevronDown, ChevronUp, Calendar, ArrowRight,
  DollarSign, X,
} from "lucide-react";
import { useVentas } from "../hooks/useVentas";
import Receipt from "./Receipt";

// ── Tooltip del gráfico ────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="text-violet-400 font-semibold">
        RD$ {Number(payload[0].value).toLocaleString("es-DO")}
      </p>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
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

// ── Períodos predefinidos ─────────────────────────────────────────────────────
const PERIODS = [
  { key: "day",   label: "Hoy"         },
  { key: "week",  label: "Esta semana" },
  { key: "month", label: "Este mes"    },
  { key: "year",  label: "Este año"    },
];

// ── DatePicker inline (sin dependencias externas) ─────────────────────────────
function DateRangePicker({ dateFrom, dateTo, onApply, onClear }) {
  const [from, setFrom] = useState(dateFrom || "");
  const [to,   setTo]   = useState(dateTo   || "");
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    if (!from) return;
    onApply(from, to);
    setOpen(false);
  };

  const handleClear = () => {
    setFrom(""); setTo("");
    onClear();
    setOpen(false);
  };

  // Etiqueta del botón
  const label = useMemo(() => {
    if (!dateFrom) return "Fecha personalizada";
    const fmt = (s) =>
      new Date(s + "T00:00:00").toLocaleDateString("es-DO", {
        day: "2-digit", month: "short", year: "numeric",
      });
    if (!dateTo || dateTo === dateFrom) return fmt(dateFrom);
    return `${fmt(dateFrom)} – ${fmt(dateTo)}`;
  }, [dateFrom, dateTo]);

  const isActive = !!dateFrom;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
          isActive
            ? "bg-violet-600 border-violet-500 text-white"
            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-violet-600 hover:text-white"
        }`}
      >
        <Calendar size={14} />
        <span className="max-w-[160px] truncate">{label}</span>
        {isActive && (
          <span
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            className="ml-1 hover:text-red-400"
          >
            <X size={12} />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-10 left-0 z-50 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl min-w-[280px]">
          <p className="text-zinc-400 text-xs uppercase tracking-widest mb-3">
            Seleccionar fechas
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-zinc-500 text-xs block mb-1">Desde</label>
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-zinc-500 text-xs block mb-1">
                Hasta <span className="text-zinc-700">(opcional — deja vacío para día exacto)</span>
              </label>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleClear}
              className="flex-1 py-2 border border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-sm transition-all"
            >
              Limpiar
            </button>
            <button
              onClick={handleApply}
              disabled={!from}
              className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              Aplicar <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function SalesDashboard() {
  const {
    ventasFiltradas,
    loading,
    kpis,
    chartData,
    period,
    dateFrom,
    dateTo,
    selectPeriod,
    selectDateRange,
  } = useVentas();

  const [selectedVenta, setSelectedVenta] = useState(null);
  const [showAll,       setShowAll]       = useState(false);

  const { totalVentas, numTransacciones, masVendido, promedio } = kpis;

  // Determina si hay un filtro de fecha personalizado activo
  const isCustomDate = period === "custom" || period === "exact";

  // Título del período activo
  const periodLabel = useMemo(() => {
    if (isCustomDate && dateFrom) {
      const fmt = (s) =>
        new Date(s + "T00:00:00").toLocaleDateString("es-DO", {
          day: "2-digit", month: "long", year: "numeric",
        });
      return dateTo && dateTo !== dateFrom
        ? `${fmt(dateFrom)} – ${fmt(dateTo)}`
        : fmt(dateFrom);
    }
    return PERIODS.find((p) => p.key === period)?.label ?? "";
  }, [period, dateFrom, dateTo, isCustomDate]);

  const displayedVentas = showAll ? ventasFiltradas : ventasFiltradas.slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Selector de período ── */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Botones predefinidos */}
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => selectPeriod(key)}
            className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
              period === key && !isCustomDate
                ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/30"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}

        {/* DatePicker personalizado */}
        <DateRangePicker
          dateFrom={isCustomDate ? dateFrom : ""}
          dateTo={isCustomDate ? dateTo : ""}
          onApply={(from, to) => selectDateRange(from, to)}
          onClear={() => selectPeriod("month")}
        />
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={TrendingUp}
          label="Ventas totales"
          value={`RD$ ${totalVentas.toLocaleString("es-DO", { maximumFractionDigits: 0 })}`}
          sub={periodLabel}
          color="bg-violet-700"
        />
        <StatCard
          icon={ShoppingCart}
          label="Transacciones"
          value={numTransacciones}
          sub={periodLabel}
          color="bg-indigo-700"
        />
        <StatCard
          icon={DollarSign}
          label="Promedio / venta"
          value={`RD$ ${promedio.toLocaleString("es-DO", { maximumFractionDigits: 0 })}`}
          sub="Por transacción"
          color="bg-teal-700"
        />
        <StatCard
          icon={Award}
          label="Más vendido"
          value={masVendido ? masVendido[0] : "—"}
          sub={masVendido ? `${masVendido[1]} unidades` : "Sin datos"}
          color="bg-amber-700"
        />
      </div>

      {/* ── Gráfico ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm">
            Ventas — {periodLabel}
          </h3>
          <span className="text-zinc-600 text-xs">RD$</span>
        </div>

        {chartData.some((d) => d.total > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                width={38}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139,92,246,0.08)" }} />
              <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[220px] text-zinc-600">
            <BarChart size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Sin ventas en este período</p>
          </div>
        )}
      </div>

      {/* ── Tabla de transacciones ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="text-white font-semibold text-sm">
            Transacciones
            <span className="ml-2 text-zinc-600 font-normal text-xs">
              ({ventasFiltradas.length})
            </span>
          </h3>
        </div>

        {ventasFiltradas.length === 0 ? (
          <div className="py-12 text-center text-zinc-600 text-sm">
            No hay transacciones en este período
          </div>
        ) : (
          <>
            <div className="divide-y divide-zinc-800/60">
              {displayedVentas.map((venta) => {
                const fecha = venta.fecha?.toDate
                  ? venta.fecha.toDate()
                  : new Date(venta.fecha);
                return (
                  <div
                    key={venta.id}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-800/30 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {venta.productoNombre}
                      </p>
                      <p className="text-zinc-500 text-xs">
                        {venta.marca} · {venta.categoria} ·{" "}
                        {fecha.toLocaleDateString("es-DO", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-violet-400 text-sm font-semibold">
                        RD$ {Number(venta.precioTotal).toLocaleString("es-DO")}
                      </p>
                      <p className="text-zinc-600 text-xs">×{venta.cantidad}</p>
                    </div>
                    <button
                      onClick={() => setSelectedVenta(venta)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-violet-900/40 text-zinc-400 hover:text-violet-300 transition-all"
                      title="Ver recibo"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {ventasFiltradas.length > 10 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="w-full py-3 text-zinc-500 hover:text-white text-xs flex items-center justify-center gap-1.5 border-t border-zinc-800 transition-colors"
              >
                {showAll ? (
                  <><ChevronUp size={13} /> Mostrar menos</>
                ) : (
                  <><ChevronDown size={13} /> Ver {ventasFiltradas.length - 10} más</>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Modal de recibo ── */}
      {selectedVenta && (
        <Receipt venta={selectedVenta} onClose={() => setSelectedVenta(null)} />
      )}
    </div>
  );
}
