import type { StorybookConfig } from "@storybook/react-vite";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	addons: [
		"@storybook/addon-onboarding",
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@chromatic-com/storybook",
		"@storybook/addon-a11y",
		"@storybook/addon-interactions",
		"storybook-addon-data-theme-switcher",
	],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	staticDirs: ["../public"],
	core: {
		builder: {
			name: "@storybook/builder-vite",
			options: {
				viteConfigPath: "./vite.config.ts",
			},
		},
	},
};
export default config;
