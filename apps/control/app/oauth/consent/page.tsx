import { MCard, MFlex, MHeading, MLinkButton, MText } from "@repo/uikit";

export default function OAuthConsentPage() {
	return (
		<MFlex
			align="center"
			justify="center"
			style={{ minHeight: "100vh", padding: 24 }}
		>
			<MCard shadow style={{ width: "100%", maxWidth: 520 }}>
				<MFlex direction="column" gap="l" align="stretch">
					<MHeading mode="h3">OAuth Consent</MHeading>
					<MText as="p" mode="secondary">
						Authorization can continue from here. If you reached this page
						directly, return to the sign-in flow.
					</MText>
					<MLinkButton href="/auth/login" stretch>
						Go to sign in
					</MLinkButton>
				</MFlex>
			</MCard>
		</MFlex>
	);
}
