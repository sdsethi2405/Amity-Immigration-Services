"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createClientAction,
  setClientActiveAction,
} from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClientRow } from "@/lib/db/portal-queries";

type ClientsManagementProps = {
  csrfToken: string;
  clients: ClientRow[];
};

export function ClientsManagement({
  csrfToken,
  clients,
}: ClientsManagementProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  function handleCreate() {
    startTransition(async () => {
      const result = await createClientAction({
        csrfToken,
        email,
        full_name: fullName,
        password,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Client account created");
      setEmail("");
      setFullName("");
      setPassword("");
      router.refresh();
    });
  }

  function handleToggleActive(client: ClientRow) {
    startTransition(async () => {
      const result = await setClientActiveAction({
        csrfToken,
        id: client.id,
        is_active: !client.is_active,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        client.is_active ? "Client deactivated" : "Client activated",
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="font-heading text-xl font-semibold">
          Create client account
        </h2>
        <p className="text-sm text-muted-foreground">
          Portal login for clients. Password must be at least 12 characters. A
          matter is optional — you can open one later under Matters.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="client-full-name">Full name</Label>
            <Input
              id="client-full-name"
              autoComplete="off"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-email">Email</Label>
            <Input
              id="client-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="client-password">Password</Label>
            <Input
              id="client-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <Button type="button" disabled={isPending} onClick={handleCreate}>
          {isPending ? "Creating…" : "Create client"}
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="font-heading text-xl font-semibold">Client accounts</h2>
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">No clients yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="px-2 py-2 font-medium">Email</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-border/70">
                    <td className="px-2 py-2 font-medium">
                      {client.full_name}
                    </td>
                    <td className="px-2 py-2">{client.email}</td>
                    <td className="px-2 py-2">
                      {client.is_active ? "Active" : "Inactive"}
                    </td>
                    <td className="px-2 py-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleToggleActive(client)}
                      >
                        {client.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
