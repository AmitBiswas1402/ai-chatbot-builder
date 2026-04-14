import { NextResponse } from "next/server";

function getPostLogoutRedirectUrl() {
  return "http://localhost:3000/";
}

function handleLogout() {
  const response = NextResponse.redirect(getPostLogoutRedirectUrl());

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
