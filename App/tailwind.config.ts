import { type Config } from "tailwindcss";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brandOrange: "#F97316",
        brandDarkOrange: "#EA580C",
        brandCream: "#FFFBF4",
      },
    },
  },
  plugins: [],
} satisfies Config;