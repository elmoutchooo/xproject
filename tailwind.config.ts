import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8f7", 100: "#d5eeeb", 200: "#ade0d9", 300: "#7ccac0",
          400: "#4aaea4", 500: "#2f938a", 600: "#237670", 700: "#1f5f5b",
          800: "#1c4d4a", 900: "#1a403e", 950: "#0a2524",
        },
        sand: { 50: "#fbf7f1", 100: "#f5ecdd", 200: "#ead6b8" },
        accent: { 400: "#e8935f", 500: "#d9733b", 600: "#bf5b27" },
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
