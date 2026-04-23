// src/pages/Catalog.jsx
import { useState, useMemo, Suspense, lazy, Component } from "react";
import { useProducts } from "../hooks/useProducts";
import { SlidersHorizontal, X, ChevronDown, Package } from "lucide-react";

import Navbar from "../components/Navbar";
import HeroCarousel from "../components/HeroCarousel";
import CategoryGrid from "../components/CategoryGrid";
import CartDrawer from "../components/CartDrawer";

const ProductCard  = safeLazy(() => import("../components/ProductCard"));
const ProductModal = safeLazy(() => import("../components/ProductModal"));
const Footer       = safeLazy(() => import("../components/Footer"));

function safeLazy(importFn) {
  return lazy(() => importFn().catch(() => ({ default: () => null })));
}

class ErrBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

const BRANDS     = ["Todas", "Apple", "Samsung", "Xiaomi", "Huawei", "OnePlus", "Motorola", "Otro"];
const CONDITIONS = ["Todos", "Nuevo", "Usado"];

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

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar search={search} onSearch={setSearch} />
      <HeroCarousel />
      <CategoryGrid activeCategory={category} onSelect={setCategory} />

      {/* Secondary filters */}
      <div className="border-b border-zinc-800/50 px-4 sm:px-6 py-3 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
              showFilters
                ? "bg-violet-600 border-violet-500 text-white"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            <SlidersHorizontal size={12} />
            Más filtros
          </button>

          {hasFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              {search     && <Chip label={`"${search}"`}  onRemove={() => setSearch("")} />}
              {category  !== "Todos"  && <Chip label={category}  onRemove={() => setCategory("Todos")} />}
              {brand     !== "Todas"  && <Chip label={brand}     onRemove={() => setBrand("Todas")} />}
              {condition !== "Todos"  && <Chip label={condition} onRemove={() => setCondition("Todos")} />}
              <button onClick={clearFilters} className="text-zinc-500 hover:text-white text-xs underline">
                Limpiar todo
              </button>
            </div>
          )}

          <span className="ml-auto text-zinc-600 text-xs">
            {loading ? "Cargando…" : `${filtered.length} resultados`}
          </span>
        </div>

        {showFilters && (
          <div className="max-w-7xl mx-auto mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FilterSelect label="Marca"  value={brand}     onChange={setBrand}     options={BRANDS} />
            <FilterSelect label="Estado" value={condition} onChange={setCondition} options={CONDITIONS} />
          </div>
        )}
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <Package size={52} className="text-zinc-800 mb-4" />
            <p className="text-zinc-400 text-lg font-medium">Sin resultados</p>
            <p className="text-zinc-600 text-sm mt-1">Prueba con otros filtros</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 text-violet-400 hover:text-violet-300 text-sm underline">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <ErrBoundary key={product.id} fallback={<FallbackCard product={product} />}>
                <Suspense fallback={<SkeletonCard />}>
                  <ProductCard product={product} onClick={() => setSelected(product)} />
                </Suspense>
              </ErrBoundary>
            ))}
          </div>
        )}
      </main>

      <ErrBoundary fallback={<SimpleFooter />}>
        <Suspense fallback={null}><Footer /></Suspense>
      </ErrBoundary>

      {selected && (
        <ErrBoundary fallback={null}>
          <Suspense fallback={null}>
            <ProductModal product={selected} onClose={() => setSelected(null)} />
          </Suspense>
        </ErrBoundary>
      )}

      <CartDrawer />
    </div>
  );
}

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

function FallbackCard({ product }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <p className="text-white text-sm font-medium">{product?.name ?? "Producto"}</p>
      <p className="text-violet-400 text-sm mt-1">RD$ {Number(product?.price ?? 0).toLocaleString("es-DO")}</p>
    </div>
  );
}

function SimpleFooter() {
  return (
    <footer className="border-t border-zinc-800 py-6 text-center text-zinc-600 text-xs">
      © {new Date().getFullYear()} TechVitrina · DualCore Studio
    </footer>
  );
}
