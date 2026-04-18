// src/components/Footer.jsx
import { MessageCircle, Mail, ShoppingBag, ExternalLink } from "lucide-react";

const WA_NUMBER = "18091234567";           // 👈 CAMBIA por tu número
const INSTAGRAM = "techvitrina_do";        // 👈 CAMBIA (sin @)
const EMAIL     = "dualcorestudio.devs@gmail.com";

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
              <p className="text-zinc-500 text-xs">DualCore Studio</p>
            </div>
          </div>

          {/* Canales de contacto */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <p className="text-zinc-500 text-sm hidden sm:block">Contáctanos:</p>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-800/40 hover:bg-emerald-700/60 border border-emerald-800/50 text-emerald-400 px-4 py-2 rounded-xl text-sm transition-all"
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>

            {/* Instagram — enlace externo sin ícono propietario */}
            <a
              href={`https://instagram.com/${INSTAGRAM}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-pink-900/30 hover:bg-pink-900/50 border border-pink-800/40 text-pink-400 px-4 py-2 rounded-xl text-sm transition-all"
            >
              {/* SVG inline del logo de Instagram — no depende de lucide-react */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
              Instagram
            </a>

            {/* Email */}
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
          © {new Date().getFullYear()} TechVitrina · DualCore Studio · Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}
