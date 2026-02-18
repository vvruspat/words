"use client";

import {
	MAlert,
	MButton,
	MCard,
	MFlex,
	MFormField,
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
							Use email/password
						</MText>
					</MFlex>

					{error ? <MAlert mode="error">{error}</MAlert> : null}

					<form onSubmit={handleEmailPassword}>
						<MFlex direction="column" gap="m" align="stretch">
							<MFormField
								label="Email"
								control={
									<MInput
										id="auth-email"
										required
										type="email"
										value={email}
										onChange={(event) => setEmail(event.target.value)}
									/>
								}
							/>

							<MFormField
								label="Password"
								control={
									<MInput
										id="auth-password"
										required
										type="password"
										value={password}
										onChange={(event) => setPassword(event.target.value)}
									/>
								}
							/>

							<MButton type="submit" stretch disabled={loading} size="l">
								{loading ? "Signing in..." : "Sign in"}
							</MButton>
						</MFlex>
					</form>
				</MFlex>
			</MCard>
		</MFlex>
	);
}
