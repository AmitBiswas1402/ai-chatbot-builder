import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const sessionResponse = await fetch(
    new URL("/api/auth/session", req.url),
    {
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    },
  );

  if (!sessionResponse.ok) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};