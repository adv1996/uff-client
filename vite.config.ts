import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), dts()],
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "uff-client",
      formats: ["es", "umd"],
      fileName: (format) => `uff-client.${format}.js`,
    },
  },
  resolve: {
    alias: {
      "@/": `${resolve(__dirname, "./src")}/`,
    },
  },
});
