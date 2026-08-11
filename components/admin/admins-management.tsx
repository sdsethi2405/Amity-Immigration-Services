"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createAdminAction,
  setAdminActiveAction,
} from "@/actions/admins";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminAccountRow } from "@/lib/db/admin-queries";
import type { Role, Team } from "@/lib/db/queries";

type AdminsManagementProps = {
  csrfToken: string;
  currentAdminId: string;
  admins: AdminAccountRow[];
  roles: Role[];
  teams: Team[];
};

export function AdminsManagement({
  csrfToken,
  currentAdminId,
  admins,
  roles,
  teams,
}: AdminsManagementProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const [teamId, setTeamId] = useState("");

  const selectedRole = roles.find((role) => role.id === roleId);
  const needsTeam = selectedRole?.scope === "team";

  function handleCreate() {
    startTransition(async () => {
      const result = await createAdminAction({
        csrfToken,
        username,
        password,
        roleId,
        teamId: needsTeam ? teamId || null : null,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Admin created");
      setUsername("");
      setPassword("");
      router.refresh();
    });
  }

  function handleToggleActive(admin: AdminAccountRow) {
    startTransition(async () => {
      const result = await setAdminActiveAction({
        csrfToken,
        id: admin.id,
        is_active: !admin.is_active,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        admin.is_active ? "Admin deactivated" : "Admin activated",
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="font-heading text-xl font-semibold">
          Create staff account
        </h2>
        <p className="text-sm text-muted-foreground">
          Create a Head Admin, Admin, or Staff login. Password must be at least
          12 characters. Only Head Admin can manage these accounts.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="admin-username">Username</Label>
            <Input
              id="admin-username"
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-role">Role</Label>
            <select
              id="admin-role"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={roleId}
              onChange={(e) => {
                setRoleId(e.target.value);
                const next = roles.find((role) => role.id === e.target.value);
                if (next?.scope === "global") {
                  setTeamId("");
                }
              }}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} (level {role.level}, {role.scope})
                </option>
              ))}
            </select>
          </div>
          {needsTeam ? (
            <div className="space-y-2">
              <Label htmlFor="admin-team">Team</Label>
              <select
                id="admin-team"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
        <Button type="button" disabled={isPending} onClick={handleCreate}>
          {isPending ? "Creating…" : "Create account"}
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="font-heading text-xl font-semibold">Staff accounts</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-2 py-2 font-medium">Username</th>
                <th className="px-2 py-2 font-medium">Role</th>
                <th className="px-2 py-2 font-medium">Team</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-border/70">
                  <td className="px-2 py-2 font-medium">{admin.username}</td>
                  <td className="px-2 py-2">
                    {admin.role_name ?? "—"}
                    {admin.role_level != null
                      ? ` (${admin.role_level})`
                      : ""}
                  </td>
                  <td className="px-2 py-2">{admin.team_name ?? "—"}</td>
                  <td className="px-2 py-2">
                    {admin.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="px-2 py-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={
                        isPending ||
                        (admin.id === currentAdminId && admin.is_active)
                      }
                      onClick={() => handleToggleActive(admin)}
                    >
                      {admin.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
