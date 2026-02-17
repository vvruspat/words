import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const isPublicPath = (pathname: string) => {
	if (pathname.startsWith("/auth")) return true;
	if (pathname.startsWith("/_next")) return true;
	if (pathname.startsWith("/favicon.ico")) return true;
	if (pathname.startsWith("/api")) return true;
	return false;
};

export async function middleware(request: NextRequest) {
	const { pathname, search } = request.nextUrl;

	if (isPublicPath(pathname)) {
		return NextResponse.next();
	}

	const { response, claims } = await updateSession(request);

	if (!claims) {
		const redirectUrl = request.nextUrl.clone();
		redirectUrl.pathname = "/auth/login";
		redirectUrl.searchParams.set("next", `${pathname}${search}`);
		const redirectResponse = NextResponse.redirect(redirectUrl);
		response.cookies.getAll().forEach((cookie) => {
			redirectResponse.cookies.set(cookie);
		});
		return redirectResponse;
	}

	return response;
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
