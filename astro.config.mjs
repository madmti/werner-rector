// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://docs.astro.build/en/guides/integrations-guide/sitemap/
export default defineConfig({
    site: "https://werner-rector.cl/",
    output: "static",

    integrations: [
        sitemap({
            filter: (page) => page !== "https://werner-rector.cl/old/",
        }),
    ],

    vite: {
        plugins: [tailwindcss()],
    },
});
