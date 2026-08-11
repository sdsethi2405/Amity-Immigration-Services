"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { logoutAction } from "@/actions/portal-auth";
import { Button } from "@/components/ui/button";

type PortalLogoutButtonProps = {
  csrfToken: string;
};

export function PortalLogoutButton({ csrfToken }: PortalLogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await logoutAction({ csrfToken });
        });
      }}
    >
      <LogOut className="size-4" aria-hidden />
      {isPending ? "Signing out…" : "Log out"}
    </Button>
  );
}
