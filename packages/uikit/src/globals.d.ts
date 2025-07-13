/// <reference types="vite-plugin-svgr/client" />
interface CSSModule {
	/**
	 * Returns the specific selector from imported stylesheet as string.
	 */
	[key: string]: string;
}
