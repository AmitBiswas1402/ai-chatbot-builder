import { scalekit } from "@/lib/scalekit";
import { NextResponse } from "next/server";

function getRedirectUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
  }

  return new URL("/api/auth/callback", appUrl).toString();
}

function handleLogin() {
  const redirectUrl = getRedirectUrl();
  const url = scalekit.getAuthorizationUrl(redirectUrl);

  return NextResponse.redirect(url);
}

export async function GET() {
  return handleLogin();
}

export async function POST() {
  return handleLogin();
}
