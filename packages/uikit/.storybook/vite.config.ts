/// <reference types='vitest' />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import currentConfig from "../vite.config";

export default defineConfig({
	root: currentConfig.root,
	plugins: [...(currentConfig.plugins ?? []), tsconfigPaths()],
});
