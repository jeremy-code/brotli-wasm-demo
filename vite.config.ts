import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const viteConfig = defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    viteReact({ compiler: true }),
  ],
  build: {
    cssCodeSplit: true,
    cssMinify: "lightningcss",
    minify: "oxc",
  },
});

export default viteConfig;
