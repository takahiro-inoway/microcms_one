import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

const siteUrl =
  process.env.SITE ||
  process.env.PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:4321/");

export default defineConfig({
  site: siteUrl,
  output: "server",

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});