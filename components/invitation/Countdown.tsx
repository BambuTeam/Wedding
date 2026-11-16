"use client";

import React, { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string; // e.g. "2026-11-28T16:30:00"
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculate = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isPast: false,
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <div className="text-center py-4 px-6 rounded-2xl bg-champagne-100/60 border border-champagne-300 text-carbon-800">
        <p className="font-serif italic text-2xl">¡El gran día ha llegado!</p>
      </div>
    );
  }

  const units = [
    { label: "Días", value: timeLeft.days },
    { label: "Horas", value: timeLeft.hours },
    { label: "Minutos", value: timeLeft.minutes },
    { label: "Segundos", value: timeLeft.seconds },
  ];

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
        {units.map((unit, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-champagne-400/30 shadow-luxury"
          >
            <span className="font-serif italic text-3xl sm:text-5xl font-semibold text-carbon-900 leading-none">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-carbon-500 font-sans mt-2 font-medium">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
