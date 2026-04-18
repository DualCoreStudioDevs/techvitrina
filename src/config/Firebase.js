// src/config/Firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Configuración de Firebase utilizando variables de entorno de Vite
// Importante: No debe haber comas ni puntos extra dentro de los nombres de las variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Exportar instancias de los servicios para uso global en la aplicación
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;