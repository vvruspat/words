"use client";

import { MCard, MFlex, MHeading, MLinkButton, MText } from "@repo/uikit";

export default function Home() {
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
					<MLinkButton stretch href="/manage-words" size="l">
						Go to Manage Words
					</MLinkButton>
				</MFlex>
			</MCard>
		</MFlex>
	);
}
