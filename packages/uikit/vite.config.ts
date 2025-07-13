/// <reference types='vitest' />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import svgr from "vite-plugin-svgr";

export default defineConfig({
	root: __dirname,

	plugins: [react(), svgr(), libInjectCss()],
});
