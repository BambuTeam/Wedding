"use client";

import React from "react";
import { Shield, RefreshCw, LogOut, ExternalLink, Database } from "lucide-react";
import Link from "next/link";

interface RootNavbarProps {
  userEmail: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  connectionStatus?: { connected: boolean; table: string };
}

export function RootNavbar({
  userEmail,
  isRefreshing,
  onRefresh,
  onLogout,
  connectionStatus = { connected: true, table: "EventosPlatform" },
}: RootNavbarProps) {
  const isConnected = connectionStatus.connected;
  const tableName = connectionStatus.table || "EventosPlatform";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand, Badge & AWS Status Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-[#DFC07D] flex items-center justify-center font-bold text-sm shadow-sm border border-[#C5A059]/30 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif tracking-[0.2em] text-lg font-bold text-zinc-900">
                AUREA
              </span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-100 font-sans text-[10px] font-bold uppercase tracking-wider">
                Root SuperAdmin
              </span>

              {/* AWS DynamoDB Indicator */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isConnected
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}
                title={`Tabla activa: ${tableName}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-sans font-medium">
                  AWS DynamoDB: <strong className="font-semibold">{tableName}</strong> · Conectado
                </span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
              Panel Maestro de Onboarding, Cuotas &amp; Infraestructura AWS Single-Table
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto font-sans">
          <div className="hidden lg:block text-right pr-2">
            <span className="text-[12px] text-zinc-900 font-semibold block">
              {userEmail}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sesión Segura Activa
            </span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            title="Refrescar base de datos"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-zinc-500 ${isRefreshing ? "animate-spin text-zinc-900" : ""}`}
            />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 text-xs font-semibold transition-colors"
            title="Ver Landing Page pública"
          >
            <span className="hidden sm:inline">Ver Landing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Cerrar sesión de Root"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
