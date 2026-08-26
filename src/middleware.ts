import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = new Set(["/", "/login", "/student-login"]);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const kind = req.auth?.user?.kind;
  const path = nextUrl.pathname;

  // Public document verification (anyone holding a printed doc can check it).
  const isVerify = path === "/verify" || path.startsWith("/verify/");
  const isPublic = PUBLIC_PATHS.has(path) || isVerify;
  const isPortal = path === "/portal" || path.startsWith("/portal/");

  // Unauthenticated → send to the right login, preserving intended destination.
  if (!isLoggedIn && !isPublic) {
    const login = isPortal ? "/student-login" : "/login";
    const url = new URL(login, nextUrl);
    if (path !== "/") url.searchParams.set("callbackUrl", path);
    return Response.redirect(url);
  }

  // Students are confined to the /portal area.
  if (isLoggedIn && kind === "student" && !isPortal && !isPublic) {
    return Response.redirect(new URL("/portal", nextUrl));
  }

  // Staff shouldn't land in the student portal.
  if (isLoggedIn && kind === "staff" && isPortal) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }

  return undefined;
});

export const config = {
  // Run on everything except API routes, Next internals, and static assets.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons|.*\\.(?:png|jpg|jpeg|svg|ico|webp|woff2?)$).*)",
  ],
};
