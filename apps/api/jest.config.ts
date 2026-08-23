import type { Config } from "jest";

export default {
	rootDir: "src",
	testRegex: ".*\\.spec\\.ts$",
	transform: { "^.+\\.(t|j)s$": "ts-jest" },
	collectCoverage: false,
	testEnvironment: "node",
	moduleNameMapper: { "^~/(.*)$": "<rootDir>/$1" },
} satisfies Config;
