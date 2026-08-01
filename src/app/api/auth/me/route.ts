import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { BACKEND_URL, TOKEN_COOKIE } from "@/lib/backend-url";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
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
    return NextResponse.json(json ?? { detail: "Not authenticated" }, { status: res.status });
  }

  return NextResponse.json(json);
}
