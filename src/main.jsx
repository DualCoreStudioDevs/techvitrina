// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { CartProvider } from "./context/CartContext";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("No se encontró #root en index.html");

createRoot(rootElement).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>
);
