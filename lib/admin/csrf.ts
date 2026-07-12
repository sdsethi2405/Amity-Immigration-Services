import { cookies } from "next/headers";

import { CSRF_COOKIE_NAME } from "@/lib/auth/constants";

/** Read the signed CSRF cookie for embedding in admin forms. */
export async function getCsrfTokenForForms(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value ?? "";
}
