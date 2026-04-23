// src/components/CategoryGrid.jsx
//
// Sección "Explorar Categorías". Recibe onSelect(cat) para filtrar.
// Las categorías se mapean a los valores que ya usa el catálogo.

const CATEGORIES = [
  { key: "Smartphones",   label: "Smartphones",  emoji: "📱", color: "violet" },
  { key: "Watches",       label: "Smartwatches", emoji: "⌚", color: "indigo" },
  { key: "Accesorios",    label: "Accesorios",   emoji: "🎧", color: "sky"    },
  { key: "Laptops",       label: "Laptops",      emoji: "💻", color: "teal"   },
  { key: "Consolas",      label: "Consolas",     emoji: "🎮", color: "emerald"},
  { key: "Tablets",       label: "Tablets",      emoji: "📟", color: "amber"  },
  { key: "Smart TV",      label: "Smart TV",     emoji: "📺", color: "rose"   },
];

const COLOR_MAP = {
  violet:  { border: "border-violet-700/40",  bg: "bg-violet-900/20",  hover: "hover:bg-violet-900/40",  glow: "shadow-violet-900/30",  text: "text-violet-400"  },
  indigo:  { border: "border-indigo-700/40",  bg: "bg-indigo-900/20",  hover: "hover:bg-indigo-900/40",  glow: "shadow-indigo-900/30",  text: "text-indigo-400"  },
  sky:     { border: "border-sky-700/40",     bg: "bg-sky-900/20",     hover: "hover:bg-sky-900/40",     glow: "shadow-sky-900/30",     text: "text-sky-400"     },
  teal:    { border: "border-teal-700/40",    bg: "bg-teal-900/20",    hover: "hover:bg-teal-900/40",    glow: "shadow-teal-900/30",    text: "text-teal-400"    },
  emerald: { border: "border-emerald-700/40", bg: "bg-emerald-900/20", hover: "hover:bg-emerald-900/40", glow: "shadow-emerald-900/30", text: "text-emerald-400" },
  amber:   { border: "border-amber-700/40",   bg: "bg-amber-900/20",   hover: "hover:bg-amber-900/40",   glow: "shadow-amber-900/30",   text: "text-amber-400"   },
  rose:    { border: "border-rose-700/40",    bg: "bg-rose-900/20",    hover: "hover:bg-rose-900/40",    glow: "shadow-rose-900/30",    text: "text-rose-400"    },
};

export default function CategoryGrid({ activeCategory, onSelect }) {
  return (
    <section className="border-b border-zinc-800/50 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
          Explorar categorías
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {/* "Todos" pill */}
          <button
            onClick={() => onSelect("Todos")}
            className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
              activeCategory === "Todos"
                ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/30"
                : "bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            🛍️ Todos
          </button>

          {CATEGORIES.map(({ key, label, emoji, color }) => {
            const c = COLOR_MAP[color];
            const active = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  active
                    ? `bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/30`
                    : `${c.bg} ${c.border} ${c.hover} ${c.text} hover:shadow-lg ${c.glow}`
                }`}
              >
                <span className="text-base leading-none">{emoji}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Export list so Catalog can sync filter options
export { CATEGORIES };
