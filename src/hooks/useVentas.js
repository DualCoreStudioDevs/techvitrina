// src/hooks/useVentas.js
//
// Versión extendida:
//  - Filtro por período predefinido (day / week / month / year)
//  - Filtro por fecha exacta (DatePicker)
//  - Filtro por rango manual (dateFrom / dateTo)
//  - KPIs recalculados automáticamente al cambiar el filtro de fecha
//  - Mantiene compatibilidad total con la API anterior
//
import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "../config/Firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  where,
  Timestamp,
} from "firebase/firestore";

// ── Helpers de fecha ──────────────────────────────────────────────────────────

/** Convierte un valor de Firestore a Date nativo */
export function toDate(val) {
  if (!val) return null;
  if (val?.toDate) return val.toDate();
  if (val instanceof Date) return val;
  return new Date(val);
}

/**
 * Devuelve { start: Date, end: Date } para el período predefinido.
 * end siempre es el momento actual.
 */
export function rangeForPeriod(period) {
  const now = new Date();
  const end = now;

  if (period === "day") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return { start, end };
  }
  if (period === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay()); // domingo
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }
  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end };
  }
  if (period === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    return { start, end };
  }
  // "all" o desconocido → sin límite
  return { start: null, end: null };
}

/**
 * Devuelve { start, end } dados un dateFrom y dateTo (strings "YYYY-MM-DD").
 * Si solo viene dateFrom, end es fin de ese día.
 */
export function rangeForCustom(dateFrom, dateTo) {
  if (!dateFrom) return { start: null, end: null };
  const start = new Date(dateFrom + "T00:00:00");
  const end   = dateTo
    ? new Date(dateTo + "T23:59:59.999")
    : new Date(dateFrom + "T23:59:59.999");
  return { start, end };
}

// ── buildChartData ────────────────────────────────────────────────────────────
export function buildChartData(ventas, period, dateFrom, dateTo) {
  const now = new Date();

  // Rango personalizado o fecha exacta
  if ((period === "custom" || period === "exact") && dateFrom) {
    const start = new Date(dateFrom + "T00:00:00");
    const end   = dateTo ? new Date(dateTo + "T23:59:59") : new Date(dateFrom + "T23:59:59");
    const days  = Math.round((end - start) / 86400000) + 1;

    if (days <= 1) {
      // Una sola jornada → gráfico horario
      return Array.from({ length: 24 }, (_, h) => ({
        label: `${h}:00`,
        total: ventas
          .filter((v) => {
            const d = toDate(v.fecha);
            return d && d.getHours() === h;
          })
          .reduce((s, v) => s + (v.precioTotal || 0), 0),
      }));
    }

    // Varios días → un punto por día
    return Array.from({ length: days }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return {
        label: day.toLocaleDateString("es-DO", { day: "2-digit", month: "short" }),
        total: ventas
          .filter((v) => {
            const d = toDate(v.fecha);
            return d && d.toDateString() === day.toDateString();
          })
          .reduce((s, v) => s + (v.precioTotal || 0), 0),
      };
    });
  }

  // Períodos predefinidos (igual que antes)
  if (period === "day") {
    return Array.from({ length: 24 }, (_, h) => ({
      label: `${h}:00`,
      total: ventas
        .filter((v) => {
          const d = toDate(v.fecha);
          return (
            d &&
            d.getFullYear() === now.getFullYear() &&
            d.getMonth()    === now.getMonth()    &&
            d.getDate()     === now.getDate()     &&
            d.getHours()    === h
          );
        })
        .reduce((s, v) => s + (v.precioTotal || 0), 0),
    }));
  }

  if (period === "week") {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - now.getDay() + i);
      return {
        label: days[i],
        total: ventas
          .filter((v) => {
            const vd = toDate(v.fecha);
            return vd && vd.toDateString() === d.toDateString();
          })
          .reduce((s, v) => s + (v.precioTotal || 0), 0),
      };
    });
  }

  if (period === "month") {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        label: `${day}`,
        total: ventas
          .filter((v) => {
            const vd = toDate(v.fecha);
            return (
              vd &&
              vd.getFullYear() === now.getFullYear() &&
              vd.getMonth()    === now.getMonth()    &&
              vd.getDate()     === day
            );
          })
          .reduce((s, v) => s + (v.precioTotal || 0), 0),
      };
    });
  }

  if (period === "year") {
    const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    return Array.from({ length: 12 }, (_, m) => ({
      label: months[m],
      total: ventas
        .filter((v) => {
          const vd = toDate(v.fecha);
          return vd && vd.getFullYear() === now.getFullYear() && vd.getMonth() === m;
        })
        .reduce((s, v) => s + (v.precioTotal || 0), 0),
    }));
  }

  return [];
}

// ── Hook principal ────────────────────────────────────────────────────────────
export function useVentas() {
  const [ventas,  setVentas]  = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado de filtro de fecha
  // period: "day" | "week" | "month" | "year" | "custom" | "exact"
  // dateFrom, dateTo: strings "YYYY-MM-DD"
  const [period,   setPeriod]   = useState("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  // Listener: carga últimas 500 ventas para cálculos client-side
  // (para grandes volúmenes considera server-side con where() por fechas)
  useEffect(() => {
    const q = query(
      collection(db, "ventas"),
      orderBy("fecha", "desc"),
      limit(500)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setVentas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("[useVentas] error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // ── Ventas filtradas por el período / rango activo ───────────────────────
  const ventasFiltradas = useMemo(() => {
    let range;

    if (period === "custom" || period === "exact") {
      range = rangeForCustom(dateFrom, dateTo);
    } else {
      range = rangeForPeriod(period);
    }

    if (!range.start && !range.end) return ventas; // sin restricción

    return ventas.filter((v) => {
      const d = toDate(v.fecha);
      if (!d) return false;
      const afterStart = range.start ? d >= range.start : true;
      const beforeEnd  = range.end   ? d <= range.end   : true;
      return afterStart && beforeEnd;
    });
  }, [ventas, period, dateFrom, dateTo]);

  // ── KPIs recalculados ────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalVentas      = ventasFiltradas.reduce((s, v) => s + (v.precioTotal || 0), 0);
    const numTransacciones = ventasFiltradas.length;

    // Producto más vendido
    const conteo = {};
    ventasFiltradas.forEach((v) => {
      conteo[v.productoNombre] = (conteo[v.productoNombre] || 0) + (v.cantidad || 1);
    });
    const masVendido = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0] ?? null;

    // Promedio por transacción
    const promedio = numTransacciones ? totalVentas / numTransacciones : 0;

    return { totalVentas, numTransacciones, masVendido, promedio };
  }, [ventasFiltradas]);

  // ── Datos para gráfico ───────────────────────────────────────────────────
  const chartData = useMemo(
    () => buildChartData(ventasFiltradas, period, dateFrom, dateTo),
    [ventasFiltradas, period, dateFrom, dateTo]
  );

  // ── Acciones de filtro ───────────────────────────────────────────────────
  /** Selecciona período predefinido y limpia el rango personalizado */
  const selectPeriod = useCallback((p) => {
    setPeriod(p);
    setDateFrom("");
    setDateTo("");
  }, []);

  /**
   * Selecciona fecha exacta o rango.
   * Si solo se pasa `from`, es un día exacto.
   * Si se pasan ambos, es un rango.
   */
  const selectDateRange = useCallback((from, to = "") => {
    setPeriod(to ? "custom" : "exact");
    setDateFrom(from);
    setDateTo(to);
  }, []);

  // ── Registrar venta (sin cambios) ────────────────────────────────────────
  const registrarVenta = useCallback(async ({ producto, cantidad = 1, nota = "" }) => {
    const precioTotal = Number(producto.price) * cantidad;

    const ventaRef = await addDoc(collection(db, "ventas"), {
      productoId:     producto.id,
      productoNombre: producto.name,
      productoPrecio: Number(producto.price),
      marca:          producto.brand    || "",
      categoria:      producto.category || "",
      cantidad,
      precioTotal,
      nota,
      fecha:          serverTimestamp(),
    });

    await updateDoc(doc(db, "products", producto.id), {
      stock: increment(-cantidad),
    });

    return ventaRef.id;
  }, []);

  // Retrocompatibilidad: statsDelMes() usa la vista "month" hardcodeada
  const statsDelMes = useCallback(() => {
    const saved = { period, dateFrom, dateTo };
    // Calcula KPIs del mes actual sin alterar el estado
    const now = new Date();
    const delMes = ventas.filter((v) => {
      const d = toDate(v.fecha);
      return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalVentas      = delMes.reduce((s, v) => s + (v.precioTotal || 0), 0);
    const numTransacciones = delMes.length;
    const conteo = {};
    delMes.forEach((v) => {
      conteo[v.productoNombre] = (conteo[v.productoNombre] || 0) + (v.cantidad || 1);
    });
    const masVendido = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0];
    const hoy = new Date();
    const porDia = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - (6 - i));
      const label = d.toLocaleDateString("es-DO", { weekday: "short" });
      const total = ventas
        .filter((v) => {
          const vd = toDate(v.fecha);
          return vd && vd.toDateString() === d.toDateString();
        })
        .reduce((s, v) => s + (v.precioTotal || 0), 0);
      return { label, total };
    });
    return { totalVentas, numTransacciones, masVendido, porDia };
  }, [ventas]);

  return {
    // Datos
    ventas,
    ventasFiltradas,
    loading,
    // KPIs reactivos
    kpis,
    chartData,
    // Estado de filtro de fecha
    period,
    dateFrom,
    dateTo,
    // Acciones
    selectPeriod,
    selectDateRange,
    registrarVenta,
    // Retrocompatibilidad
    statsDelMes,
  };
}
