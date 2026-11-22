import type { Config } from "tailwindcss";

// Charte CS Tours : Corail #E0654F · Blanc #FFFFFF · Brun encre #2B2220 · Typo Outfit
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // brand : tons corail (clairs → moyens) puis brun encre pour les fonds sombres
        brand: {
          50: "#fdf3f1", 100: "#fbe5e0", 200: "#f6c8be", 300: "#efa392", 400: "#e8816b",
          500: "#e0654f", 600: "#cd523c", 700: "#b0432f",
          800: "#3a2f2b", 900: "#2b2220", 950: "#1e1816",
        },
        coral: { 50: "#fdf3f1", 100: "#fbe5e0", 400: "#e8816b", 500: "#e0654f", 600: "#cd523c", 700: "#b0432f" },
        ink: { 50: "#f7f4f3", 100: "#ede7e5", 200: "#d8cfcb", 300: "#b6a9a3", 400: "#8e7f78", 500: "#6e605a", 600: "#574b46", 700: "#463c38", 800: "#3a2f2b", 900: "#2b2220", 950: "#1e1816" },
        sand: { 50: "#fcf7f5", 100: "#f9eeea", 200: "#f0dcd5" },
        accent: { 400: "#e8816b", 500: "#e0654f", 600: "#cd523c" },
      },
      fontFamily: { sans: ["Outfit", "system-ui", "sans-serif"] },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "none" } },
        float: { "0%,100%": { transform: "translate(0,0) scale(1)" }, "50%": { transform: "translate(30px,-25px) scale(1.08)" } },
        drive: { from: { transform: "translateX(-110%)" }, to: { transform: "translateX(110vw)" } },
        "road-flow": { to: { backgroundPosition: "-92px 0" } },
        dash: { to: { strokeDashoffset: "-92" } },
        spin: { to: { transform: "rotate(360deg)" } },
        shine: { from: { transform: "translateX(-120%) skewX(-20deg)" }, to: { transform: "translateX(220%) skewX(-20deg)" } },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(.2,.7,.2,1) both",
        float: "float 14s ease-in-out infinite",
        "float-slow": "float 20s ease-in-out infinite reverse",
        drive: "drive 14s linear infinite",
        "road-flow": "road-flow 0.6s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
