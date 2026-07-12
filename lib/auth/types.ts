import type { RoleScope } from "@/lib/db/queries";

export type CurrentAdminRole = {
  id: string;
  name: string;
  level: number;
  scope: RoleScope;
};

export type CurrentAdminTeam = {
  id: string;
  name: string;
  slug: string;
};

export type CurrentAdmin = {
  id: string;
  username: string;
  is_active: boolean;
  team_id: string | null;
  role: CurrentAdminRole;
  team: CurrentAdminTeam | null;
  sessionId: string;
};
