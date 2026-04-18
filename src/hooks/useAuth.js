// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { auth } from "../config/Firebase";          // ← F mayúscula
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);    // true hasta que Firebase responda

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);                            // ← siempre se libera
    });
    return () => unsubscribe();
  }, []);

  const login  = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  return { user, loading, login, logout };
}
