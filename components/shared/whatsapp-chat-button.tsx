import { MessageCircle } from "lucide-react";

import { getSiteSetting } from "@/lib/db/queries";
import { getDictionaryForRequest } from "@/lib/i18n/locale";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export async function WhatsAppChatButton() {
  const [setting, { dictionary }] = await Promise.all([
    getSiteSetting("whatsapp_e164"),
    getDictionaryForRequest(),
  ]);

  const raw =
    typeof setting === "string"
      ? setting
      : setting &&
          typeof setting === "object" &&
          "number" in setting &&
          typeof (setting as { number?: unknown }).number === "string"
        ? (setting as { number: string }).number
        : "";

  const digits = digitsOnly(raw);
  if (!digits) return null;

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:right-6 md:bottom-6"
    >
      <MessageCircle className="size-4" aria-hidden />
      {dictionary.common.chatWhatsApp}
    </a>
  );
}
