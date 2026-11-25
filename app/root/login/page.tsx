"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

export default function RootLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/root/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Credenciales incorrectas.");
      }

      // Redirigir al panel /root
      router.push("/root");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Error al autenticar con el panel maestro.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFillDev = () => {
    setEmail("admin@aurea.lat");
    setPassword("AureaAdmin2025!");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#B89758]/20 selection:text-[#18181B]">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#18181B] text-[#DFC07D] flex items-center justify-center mx-auto shadow-md border border-[#C5A059]/30">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-serif tracking-[0.2em] text-2xl font-bold text-zinc-900 mt-2">
            AUREA
          </h1>
          <p className="text-[13px] uppercase tracking-wider font-semibold text-zinc-500 font-sans">
            Panel Maestro de Administración · Root
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-zinc-200/90 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 font-sans">
              Acceso a Control Central
            </h2>
            <p className="text-xs text-zinc-500 font-sans mt-0.5">
              Ingresa tus credenciales autorizadas de SuperAdmin para gestionar clientes, eventos y cuotas.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans flex items-center gap-2">
              <span className="font-bold">Error:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@aurea.lat"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-zinc-200 text-[13px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 font-sans transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                Contraseña Maestra
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-zinc-200 text-[13px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 font-sans transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-zinc-900 hover:bg-black text-white font-semibold text-[13px] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Panel Maestro</span>
                  <ArrowRight className="w-4 h-4 text-[#DFC07D]" />
                </>
              )}
            </button>
          </form>

          {/* Quick AutoFill Helper for Local Dev */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-sans">
            <span>¿Entorno de desarrollo local?</span>
            <button
              type="button"
              onClick={handleAutoFillDev}
              className="text-zinc-900 hover:text-[#8F7138] font-semibold underline underline-offset-2 transition-colors cursor-pointer"
            >
              Cargar credenciales de prueba
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-zinc-400 font-sans">
          AUREA Platform Infrastructure · AWS DynamoDB &amp; S3 Secure Architecture
        </p>
      </div>
    </div>
  );
}
