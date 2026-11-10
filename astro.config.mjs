import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://armgdnlabs.github.io",
  trailingSlash: "always",
  build: { format: "directory" },
});
