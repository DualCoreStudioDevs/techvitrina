// src/components/Receipt.jsx
import { useState } from "react";
import { Printer, X, Edit3, Check } from "lucide-react";

export default function Receipt({ venta, onClose }) {
  const [nota, setNota]       = useState(venta.nota || "");
  const [editNota, setEditNota] = useState(false);

  const fecha = venta.fecha?.toDate
    ? venta.fecha.toDate()
    : new Date();

  const fechaStr = fecha.toLocaleDateString("es-DO", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const handlePrint = () => {
    const printContent = document.getElementById("receipt-printable");
    const original     = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = original;
    window.location.reload();
  };

  return (
    <div
      className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Printer size={16} className="text-violet-400" />
            Recibo de venta
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Receipt preview */}
        <div className="p-6">
          <div
            id="receipt-printable"
            className="bg-white text-zinc-900 rounded-xl p-5 font-mono text-sm"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            {/* Store header */}
            <div className="text-center border-b-2 border-dashed border-zinc-300 pb-3 mb-3">
              <p className="font-bold text-lg">★ TechVitrina ★</p>
              <p className="text-xs text-zinc-500">DualCore Studio</p>
              <p className="text-xs text-zinc-500">Tel: +1 (809) 123-4567</p>
            </div>

            {/* Date & ID */}
            <div className="text-xs text-zinc-500 mb-3 text-center">
              <p>{fechaStr}</p>
              <p>Recibo #{venta.id?.slice(-8).toUpperCase()}</p>
            </div>

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

            {/* Nota / garantía */}
            {nota && (
              <div className="border-t border-dashed border-zinc-300 pt-3 text-xs text-zinc-600">
                <p className="font-bold mb-1">Garantía / Nota:</p>
                <p>{nota}</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t-2 border-dashed border-zinc-300 mt-3 pt-3 text-center text-xs text-zinc-400">
              <p>¡Gracias por su compra!</p>
              <p>techvitrina.vercel.app</p>
            </div>
          </div>

          {/* Edit nota */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-zinc-400 text-xs uppercase tracking-wider">
                Garantía / Nota
              </label>
              <button
                onClick={() => setEditNota((v) => !v)}
                className="text-violet-400 hover:text-violet-300 flex items-center gap-1 text-xs"
              >
                {editNota ? <><Check size={12} /> Listo</> : <><Edit3 size={12} /> Editar</>}
              </button>
            </div>
            {editNota ? (
              <textarea
                rows={3}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors resize-none"
              />
            ) : (
              <p className="text-zinc-500 text-sm bg-zinc-800/50 rounded-lg px-3 py-2 min-h-[2.5rem]">
                {nota || "Sin nota"}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
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
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
