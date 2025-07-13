import { Suspense } from "react";
import * as Icons from "./index";
import type { MIconProps } from "./types";

type MIconLoaderProps = MIconProps & {
	name: string;
};

export const MIconLoader = ({ name, ...restProps }: MIconLoaderProps) => {
	// biome-ignore lint/performance/noDynamicNamespaceImportAccess: dynamic import for icon loading
	const LazyComponent = Icons[name];

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LazyComponent {...restProps} />
		</Suspense>
	);
};

export default MIconLoader;
