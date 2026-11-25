"use client";

import React, { useState } from "react";
import { Gift, Copy, Check, ExternalLink, CreditCard } from "lucide-react";
import { EventMeta } from "@/lib/types";

interface GiftRegistryProps {
  event: EventMeta;
}

export function GiftRegistry({ event }: GiftRegistryProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-champagne-400/30 shadow-luxury">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-100 text-champagne-800 text-[12px] font-sans font-semibold uppercase tracking-widest mb-3">
          <Gift className="w-3.5 h-3.5 text-champagne-600" />
          <span>Mesa de Regalos</span>
        </div>
        <h3 className="font-serif text-3xl sm:text-4xl text-zinc-900 font-normal">
          Nuestra Mejor Aventura Comienza
        </h3>
        <p className="text-[13px] sm:text-sm text-zinc-600 max-w-lg mx-auto mt-2 font-sans">
          Su presencia y cariño es nuestro mayor regalo. Si desean tener un detalle con nosotros, ponemos a su disposición estas opciones:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {event.giftRegistries.map((item, index) => {
          const isUrl = item.codeOrUrl.startsWith("http");
          const isCopied = copiedIndex === index;

          return (
            <div
              key={index}
              className="flex flex-col justify-between p-5 rounded-2xl bg-alabaster-50 border border-champagne-300/40 hover:border-champagne-500/60 transition-all shadow-sm"
            >
              <div>
                <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#8C6D46]">
                  {item.type === "bank" ? "Transferencia Directa" : "Tienda / Mesa"}
                </span>
                <h4 className="font-serif text-xl text-zinc-900 mt-1 font-medium">
                  {item.name}
                </h4>
                <p className="text-[12px] sm:text-[13px] text-zinc-600 mt-1 mb-4 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>

              {isUrl ? (
                <a
                  href={item.codeOrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-xl bg-stone-900 hover:bg-[#8F7138] text-[#FAF7F2] text-[13px] font-sans font-semibold transition-all shadow-sm shrink-0"
                >
                  <span className="whitespace-nowrap">Ver Mesa Online</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              ) : (
                <button
                  onClick={() => handleCopy(item.codeOrUrl, index)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-champagne-500 hover:bg-champagne-600 text-carbon-950 text-[13px] font-sans font-bold transition-all shadow-gold"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-carbon-950" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Datos</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
