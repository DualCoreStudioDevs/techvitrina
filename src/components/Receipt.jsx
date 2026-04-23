// src/components/Receipt.jsx
//
// Ticket imprimible — versión mejorada:
//  - Datos del negocio editables (RNC, Tel, Web, Garantía)
//  - Inputs del cliente (Nombre, Cédula, Teléfono)
//  - Campo de garantía personalizable por producto
//  - Soporte para múltiples items en un solo recibo
//  - Número de recibo generado automáticamente
//  - Impresión con estilos Courier limpios para impresora térmica
//  - Modo vista previa en tiempo real
//
import { useState, useId } from "react";
import {
  Printer, X, Edit3, Check, User, Building2,
  Phone, Hash, FileText, ShieldCheck, Plus, Minus,
} from "lucide-react";

// ── Datos por defecto del negocio ─────────────────────────────────────────────
const DEFAULT_STORE = {
  name:      "TechVitrina",
  rnc:       "1-23-45678-9",
  tel:       "+1 (809) 123-4567",
  web:       "techvitrina.vercel.app",
  address:   "Santo Domingo, Rep. Dom.",
  guarantee: "Garantía de 30 días contra defectos de fábrica. No cubre daños físicos ni por agua.",
};

// Genera número de recibo reproducible a partir del ID de venta
function reciboCodigo(id = "") {
  return id.slice(-8).toUpperCase().padEnd(8, "0");
}

// Formatea fecha legible en es-DO
function formatFecha(val) {
  if (!val) return new Date().toLocaleDateString("es-DO", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const d = val?.toDate ? val.toDate() : new Date(val);
  return d.toLocaleDateString("es-DO", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Componente principal ──────────────────────────────────────────────────────
/**
 * Receipt
 *
 * Props:
 *   venta   : objeto de venta de Firestore — o array de objetos para múltiples items
 *   onClose : fn()
 */
export default function Receipt({ venta, onClose }) {
  // Normalizar: puede llegar una sola venta o un array
  const items = Array.isArray(venta) ? venta : [venta];

  // ── Estado editable de la tienda ──
  const [store,     setStore]     = useState(DEFAULT_STORE);
  const [editStore, setEditStore] = useState(false);

  // ── Estado del cliente ────────────────────────────────────────────────────
  const [client, setClient] = useState({ name: "", cedula: "", tel: "" });

  // ── Descuento global (opcional) ───────────────────────────────────────────
  const [discountPct, setDiscountPct] = useState(0);

  // ── Cálculos de totales ───────────────────────────────────────────────────
  const subtotal = items.reduce((s, v) => s + Number(v.precioTotal || 0), 0);
  const discount = subtotal * (Number(discountPct) / 100);
  const total    = subtotal - discount;

  // Fecha del primer item (o ahora)
  const fecha = items[0]?.fecha;

  // ── Imprimir ──────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const content = document.getElementById("receipt-printable").innerHTML;
    const win = window.open("", "_blank", "width=420,height=700");
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8" />
      <title>Recibo #${reciboCodigo(items[0]?.id)}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          padding: 16px;
          color: #111;
          max-width: 380px;
          margin: 0 auto;
        }
        .center  { text-align: center; }
        .right   { text-align: right; }
        .dashed  { border-top: 2px dashed #aaa; margin: 8px 0; padding-top: 8px; }
        .row     { display: flex; justify-content: space-between; margin: 3px 0; }
        .bold    { font-weight: bold; }
        .small   { font-size: 11px; color: #555; }
        .total   { font-size: 16px; font-weight: bold; }
        table    { width: 100%; border-collapse: collapse; }
        td       { padding: 3px 0; vertical-align: top; }
        td.qty   { width: 30px; }
        td.price { text-align: right; width: 90px; }
        @media print {
          body { padding: 4px; }
        }
      </style>
    </head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 200);
  };

  return (
    <div
      className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* ── Header del modal ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <h2 className="font-semibold text-white flex items-center gap-2 text-sm">
            <Printer size={16} className="text-violet-400" />
            Generar Recibo
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* ── Datos del negocio ── */}
          <section className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-zinc-300 text-sm font-semibold flex items-center gap-2">
                <Building2 size={14} className="text-violet-400" />
                Datos del negocio
              </h3>
              <button
                onClick={() => setEditStore((v) => !v)}
                className="text-violet-400 hover:text-violet-300 flex items-center gap-1 text-xs transition-colors"
              >
                {editStore ? <><Check size={12} /> Guardar</> : <><Edit3 size={12} /> Editar</>}
              </button>
            </div>

            {editStore ? (
              <div className="space-y-2">
                {[
                  { key: "name",      label: "Nombre",         icon: Building2 },
                  { key: "rnc",       label: "RNC",            icon: Hash      },
                  { key: "tel",       label: "Teléfono",       icon: Phone     },
                  { key: "address",   label: "Dirección",      icon: FileText  },
                  { key: "web",       label: "Web / Slogan",   icon: FileText  },
                  { key: "guarantee", label: "Texto garantía", icon: ShieldCheck, textarea: true },
                ].map(({ key, label, icon: Icon, textarea }) => (
                  <div key={key}>
                    <label className="text-zinc-500 text-xs block mb-0.5 flex items-center gap-1">
                      <Icon size={10} /> {label}
                    </label>
                    {textarea ? (
                      <textarea
                        rows={2}
                        value={store[key]}
                        onChange={(e) => setStore((s) => ({ ...s, [key]: e.target.value }))}
                        className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-3 py-1.5 text-sm text-white outline-none resize-none transition-colors"
                      />
                    ) : (
                      <input
                        type="text"
                        value={store[key]}
                        onChange={(e) => setStore((s) => ({ ...s, [key]: e.target.value }))}
                        className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-zinc-400 text-xs space-y-0.5">
                <p className="font-semibold text-white text-sm">{store.name}</p>
                {store.address  && <p>📍 {store.address}</p>}
                <p>RNC: {store.rnc}</p>
                <p>Tel: {store.tel}</p>
                {store.web && <p className="text-zinc-500">{store.web}</p>}
              </div>
            )}
          </section>

          {/* ── Datos del cliente ── */}
          <section className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4">
            <h3 className="text-zinc-300 text-sm font-semibold flex items-center gap-2 mb-3">
              <User size={14} className="text-violet-400" />
              Datos del cliente
              <span className="text-zinc-600 font-normal text-xs">(opcional)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { key: "name",   label: "Nombre",   placeholder: "Juan Pérez"        },
                { key: "cedula", label: "Cédula",   placeholder: "001-0000000-0"     },
                { key: "tel",    label: "Teléfono", placeholder: "809-000-0000"      },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-zinc-500 text-xs block mb-0.5">{label}</label>
                  <input
                    type="text"
                    value={client[key]}
                    placeholder={placeholder}
                    onChange={(e) => setClient((c) => ({ ...c, [key]: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-700"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ── Descuento ── */}
          <section className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4">
            <h3 className="text-zinc-300 text-sm font-semibold mb-3">Descuento (opcional)</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDiscountPct((v) => Math.max(0, v - 5))}
                className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
              >
                <Minus size={13} />
              </button>
              <div className="flex-1 text-center">
                <span className="text-white text-2xl font-bold">{discountPct}%</span>
                {discountPct > 0 && (
                  <p className="text-zinc-500 text-xs mt-0.5">
                    − RD$ {discount.toLocaleString("es-DO", { maximumFractionDigits: 0 })}
                  </p>
                )}
              </div>
              <button
                onClick={() => setDiscountPct((v) => Math.min(100, v + 5))}
                className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
              >
                <Plus size={13} />
              </button>
            </div>
          </section>

          {/* ── Vista previa del ticket ── */}
          <section>
            <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Vista previa</h3>

            <div
              id="receipt-printable"
              className="bg-white text-zinc-900 rounded-xl p-5"
              style={{ fontFamily: "'Courier New', monospace", fontSize: "13px" }}
            >
              {/* Encabezado */}
              <div className="center border-b-2 border-dashed border-zinc-300 pb-3 mb-3">
                <p className="bold" style={{ fontSize: "16px" }}>★ {store.name} ★</p>
                {store.address && <p className="small">{store.address}</p>}
                <p className="small">RNC: {store.rnc}</p>
                <p className="small">Tel: {store.tel}</p>
                {store.web && <p className="small" style={{ color: "#888" }}>{store.web}</p>}
              </div>

              {/* Meta */}
              <div className="center small mb-3" style={{ color: "#555" }}>
                <p>{formatFecha(fecha)}</p>
                <p>Recibo #{reciboCodigo(items[0]?.id)}</p>
              </div>

              {/* Cliente */}
              {(client.name || client.cedula || client.tel) && (
                <div className="dashed small">
                  <p className="bold">CLIENTE:</p>
                  {client.name   && <p>Nombre:   {client.name}</p>}
                  {client.cedula && <p>Cédula:   {client.cedula}</p>}
                  {client.tel    && <p>Teléfono: {client.tel}</p>}
                </div>
              )}

              {/* Productos */}
              <div className="dashed">
                <p className="bold" style={{ marginBottom: "6px" }}>DETALLE:</p>
                <table>
                  <tbody>
                    {items.map((v, i) => (
                      <tr key={v.id ?? i}>
                        <td className="qty small">{v.cantidad}x</td>
                        <td style={{ paddingLeft: "4px" }}>
                          <span style={{ fontWeight: "bold", fontSize: "12px" }}>{v.productoNombre}</span>
                          <br />
                          <span className="small">{v.marca} · {v.categoria}</span>
                        </td>
                        <td className="price">
                          RD$ {Number(v.precioTotal).toLocaleString("es-DO")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="dashed">
                {discountPct > 0 && (
                  <>
                    <div className="row small">
                      <span>Subtotal</span>
                      <span>RD$ {subtotal.toLocaleString("es-DO")}</span>
                    </div>
                    <div className="row small" style={{ color: "#e11d48" }}>
                      <span>Descuento ({discountPct}%)</span>
                      <span>− RD$ {discount.toLocaleString("es-DO", { maximumFractionDigits: 0 })}</span>
                    </div>
                  </>
                )}
                <div className="row total">
                  <span>TOTAL</span>
                  <span>RD$ {total.toLocaleString("es-DO", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              {/* Garantía */}
              {store.guarantee && (
                <div className="dashed small" style={{ color: "#555" }}>
                  <p className="bold">Garantía:</p>
                  <p style={{ marginTop: "3px" }}>{store.guarantee}</p>
                </div>
              )}

              {/* Footer */}
              <div
                className="center small"
                style={{ borderTop: "2px dashed #ccc", marginTop: "12px", paddingTop: "10px", color: "#888" }}
              >
                <p>¡Gracias por su compra!</p>
                <p>{store.web}</p>
              </div>
            </div>
          </section>

          {/* ── Acciones ── */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 rounded-xl text-sm transition-all"
            >
              Cerrar
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Printer size={15} />
              Imprimir ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
