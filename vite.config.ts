import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
	root: path.resolve(__dirname),
	build: {
		outDir: path.resolve(__dirname, "./upload"),
		emptyOutDir: true,
		sourcemap: true,
		minify: "esbuild",
		cssCodeSplit: true,
		assetsInlineLimit: 0,
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, "./index.html"),
			},
			output: {
				assetFileNames: "assets/[name]-[hash][extname]",
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./ts"),
		},
	},
});
