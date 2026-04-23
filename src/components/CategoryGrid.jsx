// src/components/CategoryGrid.jsx
//
// Sección "Explorar Categorías" rediseñada con estilo GapMoviles:
//  - Grid de Cards con imagen de fondo real (Unsplash curada por categoría)
//  - Texto superpuesto con gradiente oscuro
//  - Animación hover de escala en imagen
//  - Pill activo sobre la card seleccionada
//  - Fallback gracioso si la imagen no carga
//
// Props:
//   activeCategory : string  — categoría seleccionada actualmente
//   onSelect       : fn(key) — callback al seleccionar

const CATEGORIES = [
  {
    key:   "Smartphones",
    label: "Smartphones",
    // Imagen de Unsplash (licencia libre, sin atribución requerida en UI)
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
    accent: "#7c3aed",
  },
  {
    key:   "Watches",
    label: "Smartwatches",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    accent: "#4f46e5",
  },
  {
    key:   "Accesorios",
    label: "Accesorios",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    accent: "#0ea5e9",
  },
  {
    key:   "Laptops",
    label: "Laptops",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
    accent: "#0d9488",
  },
  {
    key:   "Consolas",
    label: "Consolas",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80",
    accent: "#059669",
  },
  {
    key:   "Tablets",
    label: "Tablets",
    image: "https://images.unsplash.com/photo-1589739900266-43b2843f4c12?w=600&q=80",
    accent: "#d97706",
  },
  {
    key:   "Smart TV",
    label: "Smart TV",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80",
    accent: "#e11d48",
  },
];

// Exportar lista para que Catalog pueda sincronizar las opciones de filtro
export { CATEGORIES };

// ── Card individual ───────────────────────────────────────────────────────────
function CategoryCard({ category, isActive, onSelect }) {
  const { key, label, image, accent } = category;

  return (
    <button
      onClick={() => onSelect(key)}
      className="relative flex-shrink-0 snap-start overflow-hidden rounded-2xl cursor-pointer group focus:outline-none"
      style={{
        width:  "140px",
        height: "100px",
        // Ring de color del acento cuando está activa
        boxShadow: isActive ? `0 0 0 2.5px ${accent}, 0 8px 24px rgba(0,0,0,0.5)` : "0 4px 12px rgba(0,0,0,0.4)",
        transition: "box-shadow 0.25s ease",
      }}
      aria-pressed={isActive}
    >
      {/* Imagen de fondo con zoom en hover */}
      <img
        src={image}
        alt={label}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          // Fallback: color sólido si la imagen no carga
          e.target.style.display = "none";
        }}
      />

      {/* Gradiente oscuro superpuesto */}
      <div
        className="absolute inset-0"
        style={{
          background: isActive
            ? `linear-gradient(160deg, ${accent}cc 0%, ${accent}33 100%)`
            : "linear-gradient(160deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 100%)",
          transition: "background 0.3s ease",
        }}
      />

      {/* Texto */}
      <div className="absolute inset-0 flex flex-col justify-end p-3">
        <span
          className="text-white text-xs font-bold leading-tight drop-shadow-md"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
        >
          {label}
        </span>
      </div>

      {/* Pill "activo" */}
      {isActive && (
        <div
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }}
        />
      )}
    </button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function CategoryGrid({ activeCategory, onSelect }) {
  return (
    <section className="border-b border-zinc-800/50 py-5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
          Explorar categorías
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {/* Botón "Todos" (pill, no card) */}
          <button
            onClick={() => onSelect("Todos")}
            className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 self-center ${
              activeCategory === "Todos"
                ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/30"
                : "bg-zinc-800/70 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            🛍️ Todos
          </button>

          {/* Cards de categorías */}
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.key}
              category={cat}
              isActive={activeCategory === cat.key}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
