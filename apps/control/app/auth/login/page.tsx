import { MSpinner } from "@repo/uikit";
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
	return (
		<Suspense fallback={<MSpinner />}>
			<LoginClient />
		</Suspense>
	);
}
