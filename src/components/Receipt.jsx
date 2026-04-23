// src/components/Receipt.jsx
// Ticket imprimible con: Header editable (logo/RNC/Tel), datos del cliente,
// detalle de productos, y footer de garantía personalizable.
import { useState, useRef } from "react";
import { Printer, X, Edit3, Check, User, Building2, Phone, Hash, FileText } from "lucide-react";

// ── Datos del negocio (editables en UI) ──────────────────────────────────────
const DEFAULT_STORE = {
  name: "TechVitrina",
  rnc:  "1-23-45678-9",
  tel:  "+1 (809) 123-4567",
  web:  "techvitrina.vercel.app",
  guarantee: "Garantía de 30 días contra defectos de fábrica. No cubre daños físicos ni por agua.",
};

export default function Receipt({ venta, onClose }) {
  // ── Store config (editable) ──────────────────────────────────────────────
  const [store,     setStore]     = useState(DEFAULT_STORE);
  const [editStore, setEditStore] = useState(false);

  // ── Client data ──────────────────────────────────────────────────────────
  const [client, setClient] = useState({ name: "", cedula: "", tel: "" });

  const fecha = venta.fecha?.toDate ? venta.fecha.toDate() : new Date();
  const fechaStr = fecha.toLocaleDateString("es-DO", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const content = document.getElementById("receipt-printable").innerHTML;
    const win = window.open("", "_blank", "width=400,height=600");
    win.document.write(`
      <!DOCTYPE html><html><head>
        <title>Recibo #${venta.id?.slice(-8).toUpperCase()}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 13px; margin: 0; padding: 16px; color: #111; }
          * { box-sizing: border-box; }
          .center { text-align: center; }
          .dashed { border-top: 2px dashed #999; margin: 8px 0; padding-top: 8px; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; }
          .bold { font-weight: bold; }
          .small { font-size: 11px; color: #555; }
          .total { font-size: 15px; font-weight: bold; }
        </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div
      className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Printer size={16} className="text-violet-400" />
            Generar Recibo
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* ── Store config editor ── */}
          <section className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-zinc-300 text-sm font-semibold flex items-center gap-2">
                <Building2 size={14} className="text-violet-400" />
                Datos del negocio
              </h3>
              <button
                onClick={() => setEditStore((v) => !v)}
                className="text-violet-400 hover:text-violet-300 flex items-center gap-1 text-xs"
              >
                {editStore ? <><Check size={12} /> Guardar</> : <><Edit3 size={12} /> Editar</>}
              </button>
            </div>
            {editStore ? (
              <div className="space-y-2">
                {[
                  { key: "name",      label: "Nombre",    icon: Building2 },
                  { key: "rnc",       label: "RNC",       icon: Hash },
                  { key: "tel",       label: "Teléfono",  icon: Phone },
                  { key: "web",       label: "Web/Slogan",icon: FileText },
                  { key: "guarantee", label: "Texto garantía", icon: FileText, textarea: true },
                ].map(({ key, label, icon: Icon, textarea }) => (
                  <div key={key}>
                    <label className="text-zinc-500 text-xs block mb-0.5">{label}</label>
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
                <p className="font-semibold text-white">{store.name}</p>
                <p>RNC: {store.rnc}</p>
                <p>Tel: {store.tel}</p>
              </div>
            )}
          </section>

          {/* ── Client data ── */}
          <section className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4">
            <h3 className="text-zinc-300 text-sm font-semibold flex items-center gap-2 mb-3">
              <User size={14} className="text-violet-400" />
              Datos del cliente <span className="text-zinc-600 font-normal">(opcional)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { key: "name",   label: "Nombre",  placeholder: "Juan Pérez" },
                { key: "cedula", label: "Cédula",  placeholder: "001-0000000-0" },
                { key: "tel",    label: "Teléfono",placeholder: "809-000-0000" },
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

          {/* ── Ticket preview ── */}
          <section>
            <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Vista previa</h3>
            <div
              id="receipt-printable"
              className="bg-white text-zinc-900 rounded-xl p-5 font-mono text-sm"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {/* Store header */}
              <div className="text-center border-b-2 border-dashed border-zinc-300 pb-3 mb-3">
                <p className="font-bold text-lg">★ {store.name} ★</p>
                <p className="text-xs text-zinc-500">RNC: {store.rnc}</p>
                <p className="text-xs text-zinc-500">Tel: {store.tel}</p>
                {store.web && <p className="text-xs text-zinc-400">{store.web}</p>}
              </div>

              {/* Meta */}
              <div className="text-xs text-zinc-500 mb-3 text-center">
                <p>{fechaStr}</p>
                <p>Recibo #{venta.id?.slice(-8).toUpperCase()}</p>
              </div>

              {/* Client */}
              {(client.name || client.cedula || client.tel) && (
                <div className="border-b border-dashed border-zinc-300 pb-2 mb-3 text-xs space-y-0.5">
                  <p className="font-bold text-xs">CLIENTE:</p>
                  {client.name   && <p>Nombre:  {client.name}</p>}
                  {client.cedula && <p>Cédula:  {client.cedula}</p>}
                  {client.tel    && <p>Tel:     {client.tel}</p>}
                </div>
              )}

              {/* Product */}
              <div className="border-b border-dashed border-zinc-300 pb-3 mb-3 space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium truncate max-w-[160px]">{venta.productoNombre}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>{venta.marca} · {venta.categoria}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Cant: {venta.cantidad} × RD$ {Number(venta.productoPrecio).toLocaleString("es-DO")}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between font-bold text-base mb-3">
                <span>TOTAL</span>
                <span>RD$ {Number(venta.precioTotal).toLocaleString("es-DO")}</span>
              </div>

              {/* Guarantee */}
              {store.guarantee && (
                <div className="border-t border-dashed border-zinc-300 pt-3 text-xs text-zinc-600">
                  <p className="font-bold mb-1">Garantía:</p>
                  <p>{store.guarantee}</p>
                </div>
              )}

              {/* Footer */}
              <div className="border-t-2 border-dashed border-zinc-300 mt-3 pt-3 text-center text-xs text-zinc-400">
                <p>¡Gracias por su compra!</p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3">
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
