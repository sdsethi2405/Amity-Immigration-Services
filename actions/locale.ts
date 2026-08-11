"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  LOCALE_COOKIE_NAME,
  type Locale,
} from "@/lib/i18n/dictionaries";
import { parseLocale } from "@/lib/i18n/locale";

export async function setLocaleAction(localeInput: string): Promise<void> {
  const locale: Locale = parseLocale(localeInput);
  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
}
