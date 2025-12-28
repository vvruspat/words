import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	turbopack: {
		rules: {
			"*.svg": {
				loaders: ["@svgr/webpack"],
				as: "*.js",
			},
		},
	},
	// Allow cross-origin requests in development
	...(process.env.NODE_ENV === "development" && {
		allowedDevOrigins: [
			"dev-control.whitesquirrel.digital",
			"localhost",
			"127.0.0.1",
		],
	}),
};

export default nextConfig;
