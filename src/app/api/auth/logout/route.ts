import { scalekit } from "@/lib/scalekit";
import { NextResponse } from "next/server";

function getPostLogoutRedirectUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
  }

  return new URL("/", appUrl).toString();
}

function handleLogout() {
  const postLogoutRedirectUrl = getPostLogoutRedirectUrl();
  const logoutUrl = scalekit.getLogoutUrl({
    postLogoutRedirectUri: postLogoutRedirectUrl,
  });

  const response = NextResponse.redirect(logoutUrl);

  response.cookies.set("access_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return response;
}

export async function GET() {
  return handleLogout();
}

export async function POST() {
  return handleLogout();
}
