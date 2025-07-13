import type { ComponentProps } from "react";

export const SortIcon = (svgProps: ComponentProps<"svg">) => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 20 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...svgProps}
	>
		<path
			d="M5 7.5L10 12.5L15 7.5"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);
