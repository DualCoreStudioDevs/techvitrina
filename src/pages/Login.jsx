// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import { auth } from "../config/Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/admin");
    } catch (err) {
      console.error("Login error:", err.code, err.message);

      // Mensajes de error específicos
      const errorMessages = {
        "auth/invalid-credential":     "Credenciales incorrectas. Verifica tu email y contraseña.",
        "auth/invalid-email":          "El formato del email no es válido.",
        "auth/user-disabled":          "Esta cuenta está deshabilitada.",
        "auth/too-many-requests":      "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
        "auth/network-request-failed": "Error de red. Verifica tu conexión a internet.",
        "auth/user-not-found":         "No existe una cuenta con ese email.",
        "auth/wrong-password":         "Contraseña incorrecta.",
      };

      setError(errorMessages[err.code] || `Error: ${err.code}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="text-center">
          <div className="bg-violet-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-900/50">
            <ShoppingBag size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white">TechVitrina</h1>
          <p className="text-zinc-500 text-sm mt-1">Panel de administración</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-5">

          {/* Error message con código visible */}
          {error && (
            <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={11} /> Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ejemplo.com"
                autoComplete="email"
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Lock size={11} /> Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-4 py-2.5 pr-10 text-sm text-white outline-none transition-colors placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
            >
              {loading ? "Autenticando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-xs">
          © {new Date().getFullYear()} DualCore Studio
        </p>
      </div>
    </div>
  );
}
