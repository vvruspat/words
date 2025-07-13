import Icon from "../../../icons/Brands/RedditLogo.svg?react";
import { IconModeIndex, type MIconProps } from "../types";

export const MIconRedditLogo = ({
	mode,
	width,
	height,
	viewBox,
	...restProps
}: MIconProps) => {
	const gap = 16;
	const finalWidth = Number(width ?? 32);
	const finalHeight = Number(height ?? finalWidth);
	const xPosition = (IconModeIndex.get(mode) ?? 0) * (32 + gap);
	const finalViewBox = viewBox ?? `${xPosition} 0 32 32`;

	return (
		<>
			{
				<Icon
					width={finalWidth}
					height={finalHeight}
					viewBox={finalViewBox}
					{...restProps}
				/>
			}
		</>
	);
};
