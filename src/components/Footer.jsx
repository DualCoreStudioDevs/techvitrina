// src/components/Footer.jsx
import { MessageCircle, Instagram, Mail, ShoppingBag } from "lucide-react";

const WA_NUMBER    = "18091234567";       // 👈 CAMBIA
const INSTAGRAM    = "techvitrina_do";    // 👈 CAMBIA (sin @)
const EMAIL        = "info@techvitrina.com"; // 👈 CAMBIA

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-900/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-violet-600 p-2 rounded-lg">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">TechVitrina</h3>
              <p className="text-zinc-500 text-xs">Tecnología de calidad</p>
            </div>
          </div>

          {/* Contact channels */}
          <div className="flex items-center gap-3">
            <p className="text-zinc-500 text-sm hidden sm:block">Contáctanos:</p>

            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-800/40 hover:bg-emerald-700/60 border border-emerald-800/50 text-emerald-400 px-4 py-2 rounded-xl text-sm transition-all"
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </a>

            <a
              href={`https://instagram.com/${INSTAGRAM}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-pink-900/30 hover:bg-pink-900/50 border border-pink-800/40 text-pink-400 px-4 py-2 rounded-xl text-sm transition-all"
            >
              <Instagram size={15} />
              <span className="hidden sm:inline">Instagram</span>
            </a>

            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-xl text-sm transition-all"
            >
              <Mail size={15} />
              <span className="hidden sm:inline">Email</span>
            </a>
          </div>
        </div>

        <div className="border-t border-zinc-800/60 mt-8 pt-6 text-center text-zinc-600 text-xs">
          © {new Date().getFullYear()} TechVitrina · Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}
