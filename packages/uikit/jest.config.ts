import type { Config } from "jest";

const config: Config = {
	displayName: "@repo/uikit",
	coverageDirectory: "./coverage",
	coverageReporters: ["cobertura"],
	reporters: ["default", ["jest-junit", { outputDirectory: "./junit" }]],
	rootDir: ".",
	testMatch: ["<rootDir>/src/**/*.test.ts?(x)"],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "html"],
	transform: {
		"^.+\\.(ts|tsx|js|html)$": [
			"ts-jest",
			{ tsconfig: "<rootDir>/tsconfig.spec.json" },
		],
		"^.+\\.css$": "<rootDir>/__mocks__/cssTransform.cjs",
		"^(?!.*\\.(js|jsx|css|scss|json)$)":
			"<rootDir>/__mocks__/fileTransform.cjs",
	},
	transformIgnorePatterns: [
		"[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$",
		"^.+\\.module\\.(css|sass|scss)$",
	],
	moduleNameMapper: {
		"^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
		"\\.svg\\?react$": "<rootDir>/__mocks__/svgTransform.js",
	},
	testEnvironment: "jsdom",
	/**
	 * manually set the exports names to load in common js, to mimic the behaviors of jest 27
	 * before jest didn't fully support package exports and would load in common js code (typically via main field). now jest 28+ will load in the browser esm code, but jest esm support is not fully supported.
	 * In this case we will tell jest to load in the common js code regardless of environment.
	 *
	 * this can be removed via just overriding this setting in it's usage
	 *
	 * @example
	 * module.exports = {
	 *   ...nxPreset,
	 *   testEnvironmentOptions: {},
	 * }
	 */
	testEnvironmentOptions: {
		customExportConditions: ["node", "require", "default"],
	},
	setupFiles: ["./__mocks__/matchMedia.js"],
};

export default config;
