import { getSession } from "@/lib/getSession";
import { scalekit } from "@/lib/scalekit";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function GET() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  const session = await getSession();

  if (!session) {
    if (refreshToken) {
      try {
        const refreshedTokens = await scalekit.refreshAccessToken(refreshToken);
        const refreshedResponse = NextResponse.json(
          { authenticated: true },
          { status: 200 },
        );

        refreshedResponse.cookies.set("access_token", refreshedTokens.accessToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: COOKIE_MAX_AGE,
        });

        refreshedResponse.cookies.set("refresh_token", refreshedTokens.refreshToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: COOKIE_MAX_AGE,
        });

        return refreshedResponse;
      } catch {
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true }, { status: 200 });
}
