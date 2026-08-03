import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { BACKEND_URL, TOKEN_COOKIE } from "@/lib/backend-url";

type ProxyContext = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, ctx: ProxyContext) {
  const { path } = await ctx.params;
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  const base = BACKEND_URL.replace(/\/+$/, "");
  const pathname = path.length ? `/api/${path.map(encodeURIComponent).join("/")}` : "";
  const qs = request.nextUrl.searchParams.toString();
  const url = `${base}${pathname}${qs ? `?${qs}` : ""}`;

  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const init: RequestInit = { method: request.method, headers, cache: "no-store" };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    return NextResponse.json({ detail: "Network error: could not reach the server." }, { status: 502 });
  }

  const text = await res.text();
  const contentTypeHeader = res.headers.get("content-type");
  if (!text) {
    return new NextResponse(null, { status: res.status });
  }
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {}
  if (json !== null) {
    return NextResponse.json(json, { status: res.status });
  }
  return new NextResponse(text, {
    status: res.status,
    headers: { "content-type": contentTypeHeader || "text/plain" },
  });
}

export async function GET(request: NextRequest, ctx: ProxyContext) {
  return proxy(request, ctx);
}

export async function POST(request: NextRequest, ctx: ProxyContext) {
  return proxy(request, ctx);
}

export async function PUT(request: NextRequest, ctx: ProxyContext) {
  return proxy(request, ctx);
}

export async function DELETE(request: NextRequest, ctx: ProxyContext) {
  return proxy(request, ctx);
}
