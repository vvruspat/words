import "./preview.css";
import { withThemeByDataAttribute } from "@storybook/addon-themes";

const preview = {
	decorators: [
		withThemeByDataAttribute({
			themes: {
				light: "light",
				dark: "dark",
			},
			defaultTheme: "light",
			attributeName: "data-theme",
		}),
		(Story, { _parameters }) => {
			document.documentElement.setAttribute("data-brand", "words-control");
			document.documentElement.setAttribute("data-platform", "desktop");
			return <Story />;
		},
	],

	tags: ["autodocs"],
};

import "../src/styles/index.css";

export default preview;
