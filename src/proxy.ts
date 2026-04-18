import { scalekit } from "@/lib/scalekit";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  const redirectToLogin = () => NextResponse.redirect(new URL("/", req.url));

  if (!accessToken) {
    if (!refreshToken) {
      return redirectToLogin();
    }

    try {
      const refreshedTokens = await scalekit.refreshAccessToken(refreshToken);
      const response = NextResponse.next();

      response.cookies.set("access_token", refreshedTokens.accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });

      response.cookies.set("refresh_token", refreshedTokens.refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });

      return response;
    } catch {
      return redirectToLogin();
    }
  }

  try {
    await scalekit.validateToken(accessToken);
    return NextResponse.next();
  } catch {
    if (!refreshToken) {
      return redirectToLogin();
    }

    try {
      const refreshedTokens = await scalekit.refreshAccessToken(refreshToken);
      const response = NextResponse.next();

      response.cookies.set("access_token", refreshedTokens.accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });

      response.cookies.set("refresh_token", refreshedTokens.refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });

      return response;
    } catch {
      return redirectToLogin();
    }
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};