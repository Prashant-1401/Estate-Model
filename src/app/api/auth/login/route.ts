import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { BACKEND_URL, TOKEN_COOKIE, TOKEN_MAX_AGE_SECONDS } from "@/lib/backend-url";

interface LoginPayload {
  email?: string;
  password?: string;
}

export async function POST(request: NextRequest) {
  let body: LoginPayload = {};
  try {
    body = await request.json();
  } catch {}

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ detail: "Network error: could not reach the server." }, { status: 502 });
  }

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}

  if (!res.ok) {
    const detail =
      json && typeof json === "object" && "detail" in json && typeof (json as { detail?: unknown }).detail === "string"
        ? (json as { detail: string }).detail
        : "Invalid email or password";
    return NextResponse.json({ detail }, { status: res.status });
  }

  const data = json as { access_token?: string; user?: unknown };
  if (!data.access_token || !data.user) {
    return NextResponse.json({ detail: "Unexpected response from server." }, { status: 502 });
  }

  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ user: data.user });
}
