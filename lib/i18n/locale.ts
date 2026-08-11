import { cookies } from "next/headers";

import {
  LOCALE_COOKIE_NAME,
  getDictionary,
  type Locale,
  type Dictionary,
} from "@/lib/i18n/dictionaries";

export function parseLocale(value: string | undefined | null): Locale {
  return value === "zh" ? "zh" : "en";
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

export async function getDictionaryForRequest(): Promise<{
  locale: Locale;
  dictionary: Dictionary;
}> {
  const locale = await getLocale();
  return { locale, dictionary: getDictionary(locale) };
}
