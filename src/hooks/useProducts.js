// src/hooks/useProducts.js
//
// Versión sin Firebase Storage (plan Spark gratuito).
// Las imágenes se convierten a base64 y se guardan directamente
// en Firestore. Límite recomendado: imágenes < 500KB.
// Cuando actualices a Blaze puedes migrar a Storage fácilmente.
//
import { useState, useEffect } from "react";
import { db } from "../config/Firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// Convierte un File a base64 string
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    // Advertir si la imagen es muy grande
    if (file.size > 800 * 1024) {
      console.warn("Imagen grande — comprime antes de subir para mejor rendimiento.");
    }
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result); // "data:image/jpeg;base64,..."
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Redimensiona y comprime la imagen antes de guardar
const compressImage = (file, maxWidth = 800, quality = 0.75) =>
  new Promise((resolve) => {
    const img    = new Image();
    const url    = URL.createObjectURL(file);
    img.onload = () => {
      const scale  = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width  = img.width  * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const addProduct = async (data, imageFile, onProgress) => {
    let imageUrl = "";

    if (imageFile) {
      onProgress && onProgress(30);
      imageUrl = await compressImage(imageFile);
      onProgress && onProgress(90);
    }

    const result = await addDoc(collection(db, "products"), {
      ...data,
      imageUrl,           // base64 string o ""
      imagePath: "",      // no usamos Storage
      createdAt: serverTimestamp(),
    });

    onProgress && onProgress(100);
    return result;
  };

  const updateProduct = async (id, data, imageFile, onProgress) => {
    const updates = { ...data };

    if (imageFile) {
      onProgress && onProgress(30);
      updates.imageUrl = await compressImage(imageFile);
      onProgress && onProgress(90);
    }

    const result = await updateDoc(doc(db, "products", id), updates);
    onProgress && onProgress(100);
    return result;
  };

  const deleteProduct = async (id) => {
    // Sin Storage no hay archivo que borrar
    return deleteDoc(doc(db, "products", id));
  };

  return { products, loading, addProduct, updateProduct, deleteProduct };
}
