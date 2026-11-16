import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        alabaster: {
          50: "#FCFBF9",
          100: "#FAF8F5",
          200: "#F3EFEA",
          300: "#E8E2D9",
          400: "#D6CCC0",
          500: "#BDB0A0",
        },
        champagne: {
          100: "#F9F6EE",
          200: "#F1E8D5",
          300: "#E3D3B1",
          400: "#CFB783",
          500: "#B89758",
          600: "#9E7E41",
          700: "#7F6230",
          800: "#604924",
        },
        sage: {
          50: "#F3F6F4",
          100: "#E4ECE6",
          200: "#CBD9CD",
          300: "#A7BFA9",
          400: "#7F9E84",
          500: "#4A5D4E",
          600: "#3D4E41",
          700: "#313F34",
          800: "#263028",
        },
        carbon: {
          50: "#F4F4F5",
          100: "#E4E4E7",
          200: "#D4D4D8",
          300: "#A1A1AA",
          400: "#71717A",
          500: "#52525B",
          600: "#3F3F46",
          700: "#27272A",
          800: "#18181B",
          900: "#121214",
          950: "#09090B",
        },
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 10px 40px -10px rgba(24, 24, 27, 0.08)",
        "luxury-lg": "0 20px 50px -12px rgba(24, 24, 27, 0.12)",
        gold: "0 8px 30px -4px rgba(184, 151, 88, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
