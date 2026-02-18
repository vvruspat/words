"use client";

import {
	MAlert,
	MButton,
	MCard,
	MDivider,
	MFlex,
	MHeading,
	MInput,
	MText,
} from "@repo/uikit";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginClient() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const nextPath = searchParams.get("next") ?? "/";
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const supabase = useMemo(() => createSupabaseBrowserClient(), []);

	const handleEmailPassword = async (event: React.FormEvent) => {
		event.preventDefault();
		setLoading(true);
		setError(null);

		const { error: signInError } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		setLoading(false);

		if (signInError) {
			setError(signInError.message);
			return;
		}

		router.replace(nextPath);
	};

	const handleOAuth = async (provider: "google" | "github") => {
		setLoading(true);
		setError(null);

		const { error: signInError } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
					nextPath,
				)}`,
			},
		});

		setLoading(false);

		if (signInError) {
			setError(signInError.message);
		}
	};

	return (
		<MFlex
			align="center"
			justify="center"
			style={{ minHeight: "100vh", padding: 24 }}
		>
			<MCard shadow style={{ width: "100%", maxWidth: 420 }}>
				<MFlex direction="column" gap="l" align="stretch">
					<MFlex direction="column" gap="xs" align="start">
						<MHeading mode="h3">Sign in</MHeading>
						<MText mode="secondary" as="p">
							Use email/password or continue with OAuth.
						</MText>
					</MFlex>

					<form onSubmit={handleEmailPassword}>
						<MFlex direction="column" gap="m" align="stretch">
							<MFlex direction="column" gap="xs" align="start">
								<label htmlFor="auth-email">
									<MText mode="secondary">Email</MText>
								</label>
								<MInput
									id="auth-email"
									required
									type="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
								/>
							</MFlex>

							<MFlex direction="column" gap="xs" align="start">
								<label htmlFor="auth-password">
									<MText mode="secondary">Password</MText>
								</label>
								<MInput
									id="auth-password"
									required
									type="password"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
								/>
							</MFlex>

							<MButton type="submit" stretch disabled={loading}>
								{loading ? "Signing in..." : "Sign in"}
							</MButton>
						</MFlex>
					</form>

					<MFlex direction="row" align="center" justify="center" gap="s">
						<MDivider style={{ flex: 1 }} />
						<MText mode="tertiary">or</MText>
						<MDivider style={{ flex: 1 }} />
					</MFlex>

					<MFlex direction="column" gap="s" align="stretch">
						<MButton
							mode="outlined"
							stretch
							onClick={() => handleOAuth("google")}
							disabled={loading}
							type="button"
						>
							Continue with Google
						</MButton>
						<MButton
							mode="outlined"
							stretch
							onClick={() => handleOAuth("github")}
							disabled={loading}
							type="button"
						>
							Continue with GitHub
						</MButton>
					</MFlex>

					{error ? <MAlert mode="error">{error}</MAlert> : null}
				</MFlex>
			</MCard>
		</MFlex>
	);
}
