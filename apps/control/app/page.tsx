"use client";

import { MButton, MCard, MFlex, MHeading, MText } from "@repo/uikit";
import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();

	return (
		<MFlex
			align="center"
			justify="center"
			style={{ minHeight: "100vh", padding: 24 }}
		>
			<MCard shadow style={{ width: "100%", maxWidth: 520 }}>
				<MFlex direction="column" gap="l" align="stretch">
					<MHeading mode="h3">Dashboard</MHeading>
					<MText as="p" mode="secondary">
						Manage your vocabulary workflow from here.
					</MText>
					<MButton stretch onClick={() => router.push("/manage-words")}>
						Go to Manage Words
					</MButton>
				</MFlex>
			</MCard>
		</MFlex>
	);
}
