"use client";

import { Toaster } from "sonner";

export function AdminToaster() {
  return (
    <Toaster
      position="top-right"
      duration={2500}
      closeButton
      richColors
      toastOptions={{
        className: "font-sans text-sm",
      }}
    />
  );
}
