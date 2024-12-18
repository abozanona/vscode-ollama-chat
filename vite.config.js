"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_vue_1 = __importDefault(require("@vitejs/plugin-vue"));
const path_1 = __importDefault(require("path"));
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_vue_1.default)()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: path_1.default.resolve(__dirname, 'src/main.ts')
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]'
            }
        },
        sourcemap: true,
        // Ensure the build is compatible with VSCode's webview
        target: 'esnext',
        minify: false
    },
    resolve: {
        alias: {
            '@': path_1.default.resolve(__dirname, 'src')
        }
    },
    // Configure server for development
    server: {
        hmr: {
            protocol: 'ws'
        }
    }
});
//# sourceMappingURL=vite.config.js.map