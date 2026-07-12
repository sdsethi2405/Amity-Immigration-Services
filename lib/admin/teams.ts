import type { Team } from "@/lib/db/queries";
import { getAccessibleScopes } from "@/lib/db/queries";
import { adminListTeams } from "@/lib/db/admin-queries";

export async function getScopedTeamsForAdmin(adminId: string): Promise<Team[]> {
  const [teams, scopes] = await Promise.all([
    adminListTeams(),
    getAccessibleScopes(adminId),
  ]);

  const scopeSet = new Set(scopes);
  return teams.filter((team) => scopeSet.has(team.id));
}

export function teamsToOptions(teams: Team[]) {
  return teams.map((team) => ({ id: team.id, name: team.name }));
}
