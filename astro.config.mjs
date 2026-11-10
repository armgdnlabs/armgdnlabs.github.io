import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://armgdnlabs.github.io",
  trailingSlash: "always",
  build: { format: "directory" },
  prefetch: { prefetchAll: true },
  integrations: [sitemap({ customPages: ["https://armgdnlabs.github.io/labs/monitor/"] })],
});
