import { defineConfig } from "vitest/config.js";
import path from "path";

export default defineConfig({
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "src"), // maps "~" to src folder
        },
    },
    test: {
        globals: true,
        environment: "node",
        include: ["tests/**/*.test.ts"],
    },
});
