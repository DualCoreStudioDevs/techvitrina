// src/components/HeroCarousel.jsx
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Zap, Tag, Shield, Truck } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    icon: Zap,
    tag: "¡OFERTA DEL DÍA!",
    title: "Smartphones",
    subtitle: "Gama alta al mejor precio",
    accent: "from-violet-600 to-indigo-700",
    bg: "from-violet-950/60 to-indigo-950/80",
    cta: "Ver Móviles",
    emoji: "📱",
  },
  {
    id: 2,
    icon: Tag,
    tag: "TEMPORADA",
    title: "Accesorios & Gadgets",
    subtitle: "Todo lo que necesita tu dispositivo",
    accent: "from-emerald-600 to-teal-700",
    bg: "from-emerald-950/60 to-teal-950/80",
    cta: "Explorar",
    emoji: "🎧",
  },
  {
    id: 3,
    icon: Shield,
    tag: "GARANTÍA INCLUIDA",
    title: "Laptops & Tablets",
    subtitle: "Trabaja y estudia sin límites",
    accent: "from-amber-600 to-orange-700",
    bg: "from-amber-950/60 to-orange-950/80",
    cta: "Ver Laptops",
    emoji: "💻",
  },
  {
    id: 4,
    icon: Truck,
    tag: "ENVÍO DISPONIBLE",
    title: "Consolas & Smart TV",
    subtitle: "La mejor experiencia en casa",
    accent: "from-rose-600 to-pink-700",
    bg: "from-rose-950/60 to-pink-950/80",
    cta: "Ver Gaming",
    emoji: "🎮",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = (idx) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 400);
  };

  const prev = () => go((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => go((current + 1) % SLIDES.length);

  // Auto-advance every 4 seconds
  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [current]);

  const slide = SLIDES[current];
  const Icon = slide.icon;

  return (
    <div className="relative overflow-hidden border-b border-zinc-800/50">
      {/* Slide background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-all duration-500`}
        style={{ backgroundImage: `radial-gradient(ellipse at 70% 50%, rgba(139,92,246,0.15) 0%, transparent 70%)` }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex items-center gap-8">
        {/* Content */}
        <div
          className="flex-1 min-w-0"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateX(-12px)" : "translateX(0)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}
        >
          <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${slide.accent} px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-3 shadow-lg`}>
            <Icon size={11} />
            {slide.tag}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            {slide.title}
          </h2>
          <p className="text-zinc-400 mt-2 text-sm sm:text-base">{slide.subtitle}</p>
        </div>

        {/* Emoji decoration */}
        <div
          className="hidden sm:flex flex-shrink-0 w-28 h-28 items-center justify-center text-7xl select-none"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "scale(0.8) rotate(-10deg)" : "scale(1) rotate(0deg)",
            transition: "opacity 0.35s ease, transform 0.4s ease",
            filter: "drop-shadow(0 8px 32px rgba(139,92,246,0.3))",
          }}
        >
          {slide.emoji}
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-zinc-900/60 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-zinc-900/60 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
      >
        <ChevronRight size={16} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "bg-violet-500 w-5 h-1.5"
                : "bg-zinc-600 hover:bg-zinc-400 w-1.5 h-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
