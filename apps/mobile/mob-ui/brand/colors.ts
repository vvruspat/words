export const Colors = {
	primary: {
		base: "#C6F432",
		active: "#9EC328",
		disabled: "#637A19",
	},
	greys: {
		whiteAlpha60: "rgba(255, 255, 255, 0.6)",
		white: "#FFFFFF",
		grey1: "#F1F2F4",
		grey2: "#E0E2E6",
		grey3: "#D2D5DA",
		grey4: "#30343B",
		grey5: "#A0A5B1",
		grey6: "#7E8695",
		grey7: "#636A79",
		grey8: "#494F5A",
	},
	accents: {
		pink: "#F9A1FF",
		orange: "#FA8E3E",
		blue: "#8FDAFF",
		purple: "#B394FD",
		green: "#3DA000",
		red: "#D54334",
	},
	dark: {
		black: "#000000",
		primaryBackground: "#101114",
		secondaryBackground: "#3F4040",
		dark1: "#1C1E22",
		dark2: "#25272D",
		dark3: "#30343B",
		dark4: "#3C4049",
	},

	transparent: "transparent" as const,
} as const;

export type ColorPalette = typeof Colors;
