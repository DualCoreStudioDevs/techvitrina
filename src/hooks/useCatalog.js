// src/hooks/useCatalog.js
//
// Hook centralizado que Admin y Cliente consumen para garantizar
// que ambos lean la MISMA colección "products" de Firebase con
// onSnapshot (tiempo real) y que los filtros nunca queden "perdidos".
//
// Uso básico:
//   const { filtered, filters, setFilter, clearFilters, loading } = useCatalog();
//
// Uso avanzado (Admin pasa productos ya cargados para no duplicar listener):
//   const { filtered, filters, setFilter } = useCatalog({ products: externalProducts });

import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "../config/Firebase";
import { collection, onSnapshot } from "firebase/firestore";

// ── Valores por defecto de filtros ────────────────────────────────────────────
const INITIAL_FILTERS = {
  search:    "",
  category:  "Todos",
  brand:     "Todas",
  condition: "Todos",
  minPrice:  "",
  maxPrice:  "",
};

/**
 * useCatalog
 *
 * @param {Object}  options
 * @param {Array}   [options.products]  Si se pasa, no abre un segundo listener;
 *                                       útil en Dashboard donde ya existe useProducts().
 * @returns {{
 *   products:    Array,   // lista completa sin filtrar
 *   filtered:    Array,   // lista filtrada en tiempo real
 *   loading:     boolean,
 *   filters:     Object,
 *   setFilter:   Function,  // setFilter("category", "Smartphones")
 *   clearFilters:Function,
 *   hasFilters:  boolean,
 * }}
 */
export function useCatalog({ products: externalProducts } = {}) {
  // Si no recibimos productos externos, abrimos nuestro propio listener
  const [internalProducts, setInternalProducts] = useState([]);
  const [loading, setLoading] = useState(!externalProducts);

  useEffect(() => {
    // Si recibimos productos del padre, no abrimos otro listener
    if (externalProducts) return;

    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        setInternalProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("[useCatalog] Firestore error:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [externalProducts]);

  const products = externalProducts ?? internalProducts;

  // ── Filtros ────────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  /**
   * Actualiza un campo del filtro sin perder los demás.
   * setFilter("category", "Smartphones")
   */
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Reemplaza todos los filtros de una vez.
   * setFilters({ category: "Laptops", brand: "Apple" })
   */
  const setAllFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // ── Computed: lista filtrada ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.filter((p) => {
      // Búsqueda de texto
      const q = filters.search.toLowerCase().trim();
      if (q) {
        const inName  = p.name?.toLowerCase().includes(q);
        const inBrand = p.brand?.toLowerCase().includes(q);
        const inDesc  = p.description?.toLowerCase().includes(q);
        if (!inName && !inBrand && !inDesc) return false;
      }

      // Categoría — "Todos" pasa todo
      if (filters.category !== "Todos" && p.category !== filters.category) return false;

      // Marca — "Todas" pasa todo
      if (filters.brand !== "Todas" && p.brand !== filters.brand) return false;

      // Condición — "Todos" pasa todo
      if (filters.condition !== "Todos" && p.condition !== filters.condition) return false;

      // Rango de precio
      const price = Number(p.price) || 0;
      if (filters.minPrice !== "" && price < Number(filters.minPrice)) return false;
      if (filters.maxPrice !== "" && price > Number(filters.maxPrice)) return false;

      return true;
    });
  }, [products, filters]);

  // ── hasFilters: si algún filtro está activo ───────────────────────────────
  const hasFilters = useMemo(
    () =>
      filters.search    !== INITIAL_FILTERS.search    ||
      filters.category  !== INITIAL_FILTERS.category  ||
      filters.brand     !== INITIAL_FILTERS.brand     ||
      filters.condition !== INITIAL_FILTERS.condition ||
      filters.minPrice  !== INITIAL_FILTERS.minPrice  ||
      filters.maxPrice  !== INITIAL_FILTERS.maxPrice,
    [filters]
  );

  return {
    products,
    filtered,
    loading,
    filters,
    setFilter,
    setFilters: setAllFilters,
    clearFilters,
    hasFilters,
  };
}
