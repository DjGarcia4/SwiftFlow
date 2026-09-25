import { defineConfig, devices } from "@playwright/test";

// End-to-end tests, against the production build served by `vite preview`.
// CI builds first on its own; locally, the server builds before serving.
const PORT = 4173;

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.js",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Splash and page transitions shortened, and no service worker caching
    // an older build between runs
    reducedMotion: "reduce",
    serviceWorkers: "block",
    locale: "es-AR",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: process.env.CI
      ? `npx vite preview --port ${PORT} --strictPort`
      : `npx vite build && npx vite preview --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
