import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Kept apart from vite.config.ts so tests don't load the Cloudflare/SEO plugins.
// Only pure logic is tested, so the default Node environment is enough.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  test: {
    include: ["{src,shared,worker}/**/*.test.ts"],
  },
});
