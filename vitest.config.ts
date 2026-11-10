import { defineConfig } from "vitest/config";
import { cloudflareTest } from "@cloudflare/vitest-plugin";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const alias = {
  "@": path.resolve(__dirname, "./src"),
  "@shared": path.resolve(__dirname, "./shared"),
};

// Kept apart from vite.config.ts so tests don't load the Cloudflare/SEO plugins.
export default defineConfig({
  test: {
    projects: [
      {
        // Pure client and shared logic: the default Node environment is enough
        resolve: { alias },
        test: {
          name: "unit",
          include: ["{src,shared}/**/*.test.ts"],
        },
      },
      {
        // Worker code runs inside workerd (via Miniflare) with the real Durable Object and SQLite storage
        resolve: { alias },
        plugins: [
          cloudflareTest({
            wrangler: { configPath: "./wrangler.jsonc" },
            // A fixed secret so tests never depend on a local .dev.vars
            miniflare: { bindings: { SESSION_SECRET: "test-secret" } },
          }),
        ],
        test: {
          name: "worker",
          include: ["worker/**/*.test.ts"],
        },
      },
    ],
  },
});
