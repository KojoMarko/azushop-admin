// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`[Middleware] Checking path: ${path}`);

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("[Middleware] FATAL: NEXTAUTH_SECRET environment variable is not set!");
  }

  let token = null;
  try {
    token = await getToken({ req: request, secret: secret });
    console.log(`[Middleware] Token status: ${token ? 'Exists (User ID: ' + token.sub + ')' : 'None'}`);
  } catch (error) {
    console.error("[Middleware] Error getting token:", error);
  }

  // Avoid infinite loop by not redirecting if already on /login
  if (path === "/login") {
    console.log("[Middleware] User is already on the login page. Allowing access.");
    return NextResponse.next();
  }

  // Allow valid tokens to proceed
  if (token) {
    console.log("[Middleware] Valid token detected. Allowing access.");
    return NextResponse.next();
  }

  const isPublicPage = path === "/login" || path === "/register" || path === "/otp";
  const isAuthApiCall = path.startsWith("/api/auth");

  if (isAuthApiCall) {
    console.log(`[Middleware] Allowing NextAuth API call to proceed: ${path}`);
    return NextResponse.next();
  }

  if (isPublicPage) {
    return NextResponse.next();
  }

  console.log(`[Middleware] Redirecting to login for path: ${path}`);
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};