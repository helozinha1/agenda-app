import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Poppins é sans-serif, então substituímos 'serif' por 'sans'
        sans: ["var(--font-poppins)", "sans-serif"],
      },
      colors: {
        matcha: {
          50: "#f4f7f0",
          100: "#D7DAB3",
          200: "#9FAA74",
          500: "#4A6644",
          700: "#2d4028",
        },
        strawberry: {
          50: "#FCE8EE",
          100: "#F4C7D0",
          300: "#E8A0B0",
          500: "#C66F80",
          700: "#8a3d4f",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;