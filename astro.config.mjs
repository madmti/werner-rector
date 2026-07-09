// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
    site: "https://madmti.github.io",
    base: "/werner-rector",
    output: "static",

    vite: {
        plugins: [tailwindcss()],
    },
});
