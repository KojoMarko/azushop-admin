// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`[Middleware] Checking path: ${path}`); // Log path

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("[Middleware] FATAL: NEXTAUTH_SECRET environment variable is not set!");
    // Potentially redirect to an error page or just block access
    // return new Response("Internal Server Error: Auth secret missing", { status: 500 });
  }

  let token = null;
  try {
    token = await getToken({ req: request, secret: secret });
    console.log(`[Middleware] Token status: ${token ? 'Exists (User ID: ' + token.sub + ')' : 'None'}`); // Log token status and maybe sub/id
  } catch (error) {
     console.error("[Middleware] Error getting token:", error);
  }


  // Define public paths (accessible without login)
  // IMPORTANT: Ensure /api/auth itself is NOT treated as public by the logic below
  // because getToken needs to work, but specific sub-paths might be handled differently.
  const isPublicPage = path === "/login" || path === "/register" || path === "/otp";
  const isAuthApiCall = path.startsWith("/api/auth"); // NextAuth's own API calls

  // If accessing an auth API route, let it pass through without redirect loops
  if (isAuthApiCall) {
      console.log(`[Middleware] Allowing NextAuth API call to proceed: ${path}`);
      return NextResponse.next();
  }

  // Redirect logic
  if (isPublicPage && token) {
    const dashboardUrl = new URL("/dashboard", request.url);
    console.log(`[Middleware] Redirecting logged-in user from public page ${path} to ${dashboardUrl}`);
    return NextResponse.redirect(dashboardUrl);
  }

  if (!isPublicPage && !token) {
     const loginUrl = new URL("/login", request.url);
     console.log(`[Middleware] Redirecting logged-out user from protected path ${path} to ${loginUrl}`);
     return NextResponse.redirect(loginUrl);
  }

  console.log(`[Middleware] Allowing request to proceed for path: ${path}`); // Log allowed paths
  return NextResponse.next();
}

// Updated Config: Ensure API routes needed for auth flow aren't blocked
// The negative lookahead ?! ensures paths starting with 'api/' are included
// unless they are something other than 'api/auth'.
// It also excludes static assets etc.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};