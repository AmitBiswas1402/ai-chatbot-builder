import { scalekit } from "@/lib/scalekit";
import { NextRequest, NextResponse } from "next/server";

function getRedirectUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
  }

  return new URL("/api/auth/callback", appUrl).toString();
}

export async function GET(request: NextRequest) {
  const redirectUrl = getRedirectUrl();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const idpInitiatedLogin = searchParams.get("idp_initiated_login");

  if (error) {
    const errorUrl = new URL("/", request.url);
    errorUrl.searchParams.set("auth_error", error);

    if (errorDescription) {
      errorUrl.searchParams.set("auth_error_description", errorDescription);
    }

    return NextResponse.redirect(errorUrl);
  }

  if (idpInitiatedLogin) {
    const claims = await scalekit.getIdpInitiatedLoginClaims(idpInitiatedLogin);
    const authUrl = scalekit.getAuthorizationUrl(redirectUrl, {
      connectionId: claims.connection_id,
      organizationId: claims.organization_id,
      loginHint: claims.login_hint,
      ...(claims.relay_state && { state: claims.relay_state }),
    });

    return NextResponse.redirect(authUrl);
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 },
    );
  }

  const authResponse = await scalekit.authenticateWithCode(code, redirectUrl);
  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set("access_token", authResponse.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  if (authResponse.refreshToken) {
    response.cookies.set("refresh_token", authResponse.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return response;
}
