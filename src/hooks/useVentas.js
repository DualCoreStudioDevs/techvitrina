// src/hooks/useVentas.js
import { useState, useEffect } from "react";
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
} from "firebase/firestore";

export function useVentas() {
  const [ventas,   setVentas]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "ventas"),
      orderBy("fecha", "desc"),
      limit(100)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setVentas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("useVentas error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // ── Registrar venta y descontar stock ────────────────────────────────────
  const registrarVenta = async ({ producto, cantidad = 1, nota = "" }) => {
    const precioTotal = Number(producto.price) * cantidad;

    // 1. Guardar en colección "ventas"
    const ventaRef = await addDoc(collection(db, "ventas"), {
      productoId:     producto.id,
      productoNombre: producto.name,
      productoPrecio: Number(producto.price),
      marca:          producto.brand  || "",
      categoria:      producto.category || "",
      cantidad,
      precioTotal,
      nota,
      fecha:          serverTimestamp(),
    });

    // 2. Descontar stock del producto
    await updateDoc(doc(db, "products", producto.id), {
      stock: increment(-cantidad),
    });

    return ventaRef.id;
  };

  // ── Estadísticas del mes en curso ────────────────────────────────────────
  const statsDelMes = () => {
    const ahora  = new Date();
    const mesAct = ahora.getMonth();
    const anyoAct = ahora.getFullYear();

    const delMes = ventas.filter((v) => {
      if (!v.fecha) return false;
      const d = v.fecha.toDate ? v.fecha.toDate() : new Date(v.fecha);
      return d.getMonth() === mesAct && d.getFullYear() === anyoAct;
    });

    const totalVentas = delMes.reduce((s, v) => s + (v.precioTotal || 0), 0);
    const numTransacciones = delMes.length;

    // Producto más vendido
    const conteo = {};
    delMes.forEach((v) => {
      conteo[v.productoNombre] = (conteo[v.productoNombre] || 0) + (v.cantidad || 1);
    });
    const masVendido = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0];

    // Ventas por día (últimos 7 días)
    const hoy = new Date();
    const porDia = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - (6 - i));
      const label = d.toLocaleDateString("es-DO", { weekday: "short" });
      const total = ventas
        .filter((v) => {
          if (!v.fecha) return false;
          const vd = v.fecha.toDate ? v.fecha.toDate() : new Date(v.fecha);
          return vd.toDateString() === d.toDateString();
        })
        .reduce((s, v) => s + (v.precioTotal || 0), 0);
      return { label, total };
    });

    return { totalVentas, numTransacciones, masVendido, porDia };
  };

  return { ventas, loading, registrarVenta, statsDelMes };
}
