import { google } from "googleapis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json(
      {
        error: `Google authorization failed: ${error}`,
      },
      { status: 400 }
    );
  }

  if (!code || !state) {
    return NextResponse.json(
      {
        error: "Missing Google authorization code or state.",
      },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();

  const storedState =
    cookieStore.get("google_oauth_state")?.value;

  if (!storedState || storedState !== state) {
    return NextResponse.json(
      {
        error: "Invalid OAuth state.",
      },
      { status: 400 }
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      {
        error:
          "Google OAuth environment variables are not configured.",
      },
      { status: 500 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  try {
    const { tokens } =
      await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.json(
        {
          error:
            "Google did not return a refresh token. Please revoke Evergreen's access and authorize again.",
        },
        { status: 400 }
      );
    }

    cookieStore.set(
      "google_drive_refresh_token",
      tokens.refresh_token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60,
        path: "/",
      }
    );

    cookieStore.delete("google_oauth_state");

    return NextResponse.redirect(
      new URL(
        "/admin/memories?google=connected",
        request.url
      )
    );
  } catch (error) {
    console.error(
      "Google OAuth callback error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to complete Google authorization.",
      },
      { status: 500 }
    );
  }
}