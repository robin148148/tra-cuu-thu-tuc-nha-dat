import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        legal: {
          navy: "#0f172a",
          gold: "#d97706",
          amber: "#f59e0b",
          emerald: "#059669",
        },
      },
    },
  },
  plugins: [],
};
export default config;
