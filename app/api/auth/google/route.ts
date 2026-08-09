import { google } from "googleapis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
];

export async function GET() {
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

  const state = crypto.randomBytes(32).toString("hex");

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });

  const cookieStore = await cookies();

  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });

  return NextResponse.redirect(authUrl);
}