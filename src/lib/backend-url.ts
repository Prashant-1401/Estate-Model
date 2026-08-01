export const BACKEND_URL = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000"
).replace(/\/+$/, "");

export const TOKEN_COOKIE = "estatecrm_token";

export const TOKEN_MAX_AGE_SECONDS = 24 * 60 * 60;
