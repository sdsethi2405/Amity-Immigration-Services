import { CSRF_COOKIE_NAME } from "@/lib/auth/constants";

/** Client-side helper: read CSRF cookie from document.cookie. */
export function readCsrfTokenFromDocument(): string {
  if (typeof document === "undefined") return "";

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`));

  if (!match) return "";
  return decodeURIComponent(match.slice(CSRF_COOKIE_NAME.length + 1));
}
