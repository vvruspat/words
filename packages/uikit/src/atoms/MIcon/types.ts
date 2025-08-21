import type { SVGProps } from "react";

export type MIconProps = SVGProps<SVGSVGElement> & {
	title?: string;
	titleId?: string;
	desc?: string;
	descId?: string;
} & {
	mode: "regular" | "thin" | "light" | "bold" | "fill" | "duotone";
};

export const IconModeIndex = new Map<MIconProps["mode"], number>([
	["regular", 0],
	["thin", 1],
	["light", 2],
	["bold", 3],
	["fill", 4],
	["duotone", 5],
]);
