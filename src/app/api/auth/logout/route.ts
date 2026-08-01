import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { TOKEN_COOKIE } from "@/lib/backend-url";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
  return NextResponse.json({ ok: true });
}
