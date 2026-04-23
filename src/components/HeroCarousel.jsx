// src/components/HeroCarousel.jsx
//
// Carrusel de banners con:
//  - Imágenes reales de fondo (Unsplash) con overlay de gradiente
//  - Auto-advance cada 5 segundos (pausa si el usuario interactúa)
//  - Transición suave fade + slide
//  - Botones anterior / siguiente + dots indicadores
//  - Botón CTA que dispara filtro de categoría (via prop onFilter)
//
// Props:
//   onFilter?: fn(category) — llamado al pulsar el CTA del slide
//
import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Zap, Tag, Shield, Truck } from "lucide-react";

const SLIDES = [
  {
    id:       1,
    icon:     Zap,
    tag:      "¡OFERTA DEL DÍA!",
    title:    "Smartphones",
    subtitle: "Gama alta al mejor precio",
    cta:      "Ver Móviles",
    category: "Smartphones",
    // Imagen Unsplash de smartphones
    image:    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1400&q=80",
    accent:   "from-violet-600 to-indigo-700",
    overlay:  "from-violet-950/80 via-zinc-950/50 to-transparent",
  },
  {
    id:       2,
    icon:     Tag,
    tag:      "TEMPORADA",
    title:    "Accesorios & Gadgets",
    subtitle: "Todo lo que necesita tu dispositivo",
    cta:      "Explorar",
    category: "Accesorios",
    image:    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1400&q=80",
    accent:   "from-emerald-600 to-teal-700",
    overlay:  "from-emerald-950/80 via-zinc-950/50 to-transparent",
  },
  {
    id:       3,
    icon:     Shield,
    tag:      "GARANTÍA INCLUIDA",
    title:    "Laptops & Tablets",
    subtitle: "Trabaja y estudia sin límites",
    cta:      "Ver Laptops",
    category: "Laptops",
    image:    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1400&q=80",
    accent:   "from-amber-600 to-orange-700",
    overlay:  "from-amber-950/80 via-zinc-950/50 to-transparent",
  },
  {
    id:       4,
    icon:     Truck,
    tag:      "ENVÍO DISPONIBLE",
    title:    "Consolas & Smart TV",
    subtitle: "La mejor experiencia en casa",
    cta:      "Ver Gaming",
    category: "Consolas",
    image:    "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=1400&q=80",
    accent:   "from-rose-600 to-pink-700",
    overlay:  "from-rose-950/80 via-zinc-950/50 to-transparent",
  },
];

const INTERVAL_MS = 5000;

export default function HeroCarousel({ onFilter }) {
  const [current,    setCurrent]    = useState(0);
  const [animating,  setAnimating]  = useState(false);
  const [paused,     setPaused]     = useState(false);
  const timerRef = useRef(null);

  const go = useCallback((idx) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 450);
  }, [animating]);

  const prev = useCallback(() => go((current - 1 + SLIDES.length) % SLIDES.length), [current, go]);
  const next = useCallback(() => go((current + 1) % SLIDES.length),                 [current, go]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, next]);

  const handleUserInteraction = (fn) => {
    setPaused(true);
    fn();
    // Reanudar auto-advance tras 8 s de inactividad
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPaused(false), 8000);
  };

  const slide = SLIDES[current];
  const Icon  = slide.icon;

  return (
    <div
      className="relative overflow-hidden border-b border-zinc-800/50"
      style={{ minHeight: "220px" }}
    >
      {/* ── Imágenes de fondo (todas montadas; opacidad controla la transición) ── */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          aria-hidden={i !== current}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            className="w-full h-full object-cover"
            style={{ minHeight: "220px" }}
          />
          {/* Overlay de gradiente */}
          <div className={`absolute inset-0 bg-gradient-to-r ${s.overlay}`} />
          {/* Oscurecimiento base para legibilidad del texto */}
          <div className="absolute inset-0 bg-zinc-950/40" />
        </div>
      ))}

      {/* ── Contenido del slide activo ── */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div
          style={{
            opacity:    animating ? 0 : 1,
            transform:  animating ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}
        >
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 bg-gradient-to-r ${slide.accent} px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-3 shadow-lg`}
          >
            <Icon size={11} />
            {slide.tag}
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight drop-shadow-lg">
            {slide.title}
          </h2>
          <p className="text-zinc-300 mt-2 text-sm sm:text-base drop-shadow">{slide.subtitle}</p>

          {onFilter && (
            <button
              onClick={() => handleUserInteraction(() => onFilter(slide.category))}
              className={`mt-5 inline-flex items-center gap-2 bg-gradient-to-r ${slide.accent} hover:opacity-90 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all`}
            >
              {slide.cta}
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Controles de navegación ── */}
      <button
        onClick={() => handleUserInteraction(prev)}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-900/70 border border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all backdrop-blur-sm"
        aria-label="Anterior"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={() => handleUserInteraction(next)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-900/70 border border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all backdrop-blur-sm"
        aria-label="Siguiente"
      >
        <ChevronRight size={16} />
      </button>

      {/* ── Dots indicadores ── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => handleUserInteraction(() => go(i))}
            aria-label={`Ir al slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "bg-white w-5 h-1.5"
                : "bg-zinc-500 hover:bg-zinc-300 w-1.5 h-1.5"
            }`}
          />
        ))}
      </div>

      {/* ── Barra de progreso del auto-advance ── */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800/60">
          <div
            key={current} // reinicia la animación al cambiar slide
            className="h-full bg-white/30"
            style={{
              animation: `progressBar ${INTERVAL_MS}ms linear`,
            }}
          />
        </div>
      )}

      {/* Keyframe inline para la barra de progreso */}
      <style>{`
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
