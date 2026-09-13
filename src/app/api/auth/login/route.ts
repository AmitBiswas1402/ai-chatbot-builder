import { scalekit } from "@/lib/scalekit";
import { NextRequest, NextResponse } from "next/server";

const AUTH_SCOPES = ["openid", "profile", "email", "offline_access"];

export function getRedirectUrl(request?: Request | NextRequest) {
  if (request) {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") || host?.includes("127.0.0.1") ? "http" : "https");
    if (host) {
      return `${proto}://${host}/api/auth/callback`;
    }
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return new URL("/api/auth/callback", appUrl).toString();
}

function handleLogin(request: NextRequest) {
  const redirectUrl = getRedirectUrl(request);
  const url = scalekit.getAuthorizationUrl(redirectUrl, {
    scopes: AUTH_SCOPES,
  });

  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  return handleLogin(request);
}

export async function POST(request: NextRequest) {
  return handleLogin(request);
}
