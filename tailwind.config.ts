import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        blood: {
          400: "#ef4444",
          500: "#dc2626",
          600: "#b91c1c",
          700: "#991b1b"
        }
      },
      boxShadow: {
        blood: "0 0 30px rgba(220, 38, 38, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
