// src/pages/Catalog.jsx
//
// Versión robusta: funciona aunque ProductCard, ProductModal o Footer
// aún no existan. Usa lazy + ErrorBoundary local por componente.
//
import { useState, useMemo, Suspense, lazy, Component } from "react";
import { useProducts } from "../hooks/useProducts";
import { Search, SlidersHorizontal, ShoppingBag, X, ChevronDown, Package } from "lucide-react";

// ── Lazy con fallback si el archivo no existe aún ────────────────────────────
const ProductCard  = safeLazy(() => import("../components/ProductCard"));
const ProductModal = safeLazy(() => import("../components/ProductModal"));
const Footer       = safeLazy(() => import("../components/Footer"));

function safeLazy(importFn) {
  return lazy(() =>
    importFn().catch(() => ({
      default: () => null,   // si el archivo no existe → renderiza nada
    }))
  );
}

// ── Error boundary local ──────────────────────────────────────────────────────
class ErrBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ["Todos", "Móviles", "Accesorios", "Piezas"];
const BRANDS     = ["Todas", "Apple", "Samsung", "Xiaomi", "Huawei", "OnePlus", "Motorola", "Otro"];
const CONDITIONS = ["Todos", "Nuevo", "Usado"];

// ── Main component ────────────────────────────────────────────────────────────
export default function Catalog() {
  const { products, loading } = useProducts();

  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState("Todos");
  const [brand,       setBrand]       = useState("Todas");
  const [condition,   setCondition]   = useState("Todos");
  const [selected,    setSelected]    = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((p) => {
      const q  = search.toLowerCase();
      const ms = !q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
      const mc = category  === "Todos"  || p.category  === category;
      const mb = brand     === "Todas"  || p.brand     === brand;
      const mn = condition === "Todos"  || p.condition === condition;
      return ms && mc && mb && mn;
    });
  }, [products, search, category, brand, condition]);

  const clearFilters = () => {
    setSearch(""); setCategory("Todos"); setBrand("Todas"); setCondition("Todos");
  };
  const hasFilters = search || category !== "Todos" || brand !== "Todas" || condition !== "Todos";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">

      {/* Navbar */}
      <header className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-violet-600 p-2 rounded-lg">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="hidden sm:block font-semibold text-white text-sm">TechVitrina</span>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto o marca…"
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl pl-9 pr-9 py-2 text-sm text-white outline-none transition-colors placeholder:text-zinc-600"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} className="text-zinc-500 hover:text-white" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all
              ${showFilters
                ? "bg-violet-600 border-violet-500 text-white"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="border-t border-zinc-800 px-4 sm:px-6 py-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FilterSelect label="Categoría" value={category}  onChange={setCategory}  options={CATEGORIES} />
              <FilterSelect label="Marca"     value={brand}     onChange={setBrand}     options={BRANDS} />
              <FilterSelect label="Estado"    value={condition} onChange={setCondition} options={CONDITIONS} />
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <div className="border-b border-zinc-800/50 px-4 sm:px-6 py-6 bg-violet-950/20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Catálogo de dispositivos</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {loading ? "Cargando inventario…" : `${products.length} producto${products.length !== 1 ? "s" : ""} disponibles`}
          </p>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 flex flex-wrap gap-2 items-center">
          <span className="text-zinc-600 text-xs">Activos:</span>
          {search     && <Chip label={`"${search}"`}  onRemove={() => setSearch("")} />}
          {category  !== "Todos"  && <Chip label={category}  onRemove={() => setCategory("Todos")} />}
          {brand     !== "Todas"  && <Chip label={brand}     onRemove={() => setBrand("Todas")} />}
          {condition !== "Todos"  && <Chip label={condition} onRemove={() => setCondition("Todos")} />}
          <button onClick={clearFilters} className="text-zinc-500 hover:text-white text-xs underline ml-1">
            Limpiar todo
          </button>
        </div>
      )}

      {/* Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <Package size={52} className="text-zinc-800 mb-4" />
            <p className="text-zinc-400 text-lg font-medium">Sin resultados</p>
            <p className="text-zinc-600 text-sm mt-1">Prueba con otros filtros o términos de búsqueda</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-violet-400 hover:text-violet-300 text-sm underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-zinc-500 text-xs mb-4">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <ErrBoundary key={product.id} fallback={<FallbackCard product={product} />}>
                  <Suspense fallback={<SkeletonCard />}>
                    <ProductCard product={product} onClick={() => setSelected(product)} />
                  </Suspense>
                </ErrBoundary>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <ErrBoundary fallback={<SimpleFooter />}>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </ErrBoundary>

      {/* Modal */}
      {selected && (
        <ErrBoundary fallback={null}>
          <Suspense fallback={null}>
            <ProductModal product={selected} onClose={() => setSelected(null)} />
          </Suspense>
        </ErrBoundary>
      )}
    </div>
  );
}

// ── Helper sub-components ────────────────────────────────────────────────────

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors pr-8"
        >
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
      </div>
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1 bg-violet-900/40 border border-violet-800/50 text-violet-300 text-xs px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove}><X size={10} /></button>
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="bg-zinc-800 h-44 w-full" />
      <div className="p-4 space-y-2">
        <div className="bg-zinc-800 h-3 rounded w-3/4" />
        <div className="bg-zinc-800 h-3 rounded w-1/2" />
        <div className="bg-zinc-800 h-5 rounded w-1/3 mt-3" />
      </div>
    </div>
  );
}

// Tarjeta mínima de fallback si ProductCard falla
function FallbackCard({ product }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <p className="text-white text-sm font-medium">{product?.name ?? "Producto"}</p>
      <p className="text-violet-400 text-sm mt-1">
        RD$ {Number(product?.price ?? 0).toLocaleString("es-DO")}
      </p>
    </div>
  );
}

// Footer mínimo de fallback
function SimpleFooter() {
  return (
    <footer className="border-t border-zinc-800 py-6 text-center text-zinc-600 text-xs">
      © {new Date().getFullYear()} TechVitrina · DualCore Studio
    </footer>
  );
}
