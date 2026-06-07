import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  optimizeDeps: {
    exclude: ["next/router", "next/router.js"],
  },
  plugins: [tailwindcss(), vinext(), ...(command === "build" ? [cloudflare()] : [])],
}));
