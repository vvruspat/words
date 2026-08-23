type SupabaseClaims = {
	email?: string;
	app_metadata?: Record<string, unknown>;
	[key: string]: unknown;
};

const getAdminEmails = () =>
	process.env.SUPABASE_ADMIN_EMAILS?.split(",")
		.map((email) => email.trim().toLowerCase())
		.filter(Boolean) ?? [];

export const isSupabaseAdmin = (claims: SupabaseClaims | null | undefined) => {
	if (!claims) {
		return false;
	}

	const email = claims.email?.toLowerCase();

	if (email && getAdminEmails().includes(email)) {
		return true;
	}

	const metadata = claims.app_metadata ?? {};
	const adminRole = process.env.SUPABASE_ADMIN_ROLE || "admin";
	const role = metadata.role;
	const roles = metadata.roles;

	if (role === adminRole) {
		return true;
	}

	if (Array.isArray(roles) && roles.includes(adminRole)) {
		return true;
	}

	if (
		typeof roles === "string" &&
		roles
			.split(",")
			.map((item) => item.trim())
			.includes(adminRole)
	) {
		return true;
	}

	return metadata.admin === true || metadata.is_admin === true;
};
