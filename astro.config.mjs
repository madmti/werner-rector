// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import sanity from "@sanity/astro";

// https://docs.astro.build/en/guides/integrations-guide/sitemap/
export default defineConfig({
    site: "https://werner-rector.cl/",
    output: "static",

    integrations: [
        sitemap({
            filter: (page) => page !== "https://werner-rector.cl/old/",
        }),
        sanity({
            projectId: "zopihssz",
            dataset: "production",
            apiVersion: "2024-01-01",
            useCdn: false,
        }),
    ],

    vite: {
        plugins: [tailwindcss()],
    },
});
