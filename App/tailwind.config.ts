import { type Config } from "tailwindcss";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brandPrimary: "#266AFB",
        brandDark: "#003588",
        brandLight: "#EBF1FF",
        brandPage: "#F5F8FF",
      },
    },
  },
  plugins: [],
} satisfies Config;