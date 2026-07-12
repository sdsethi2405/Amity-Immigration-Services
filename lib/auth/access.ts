import { getAccessibleScopes } from "@/lib/db/queries";

import { assertValidCsrf } from "@/lib/auth/csrf";
import {
  ADMIN_MANAGEMENT_MIN_LEVEL,
  DELETE_MIN_LEVEL,
  PUBLISH_MIN_LEVEL,
} from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import type { CurrentAdmin } from "@/lib/auth/types";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/** Load the current admin or throw. Use at the start of every admin Server Action. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new AuthError("Unauthorized");
  }

  return admin;
}

/** Enforce minimum role level (higher level = more authority). */
export function requireRoleLevel(admin: CurrentAdmin, minLevel: number): void {
  if (admin.role.level < minLevel) {
    throw new AuthError("Insufficient permissions");
  }
}

/** Contributors (level 20) cannot delete; Editors+ required. */
export function requireCanDelete(admin: CurrentAdmin): void {
  requireRoleLevel(admin, DELETE_MIN_LEVEL);
}

/** Contributors cannot publish or unpublish; Editors+ required. */
export function requireCanPublish(admin: CurrentAdmin): void {
  requireRoleLevel(admin, PUBLISH_MIN_LEVEL);
}

/**
 * Only Head Admin (global, level 100) may manage admins, roles, teams,
 * and site_settings.
 */
export function requireAdminManagement(admin: CurrentAdmin): void {
  requireRoleLevel(admin, ADMIN_MANAGEMENT_MIN_LEVEL);

  if (admin.role.scope !== "global") {
    throw new AuthError("Insufficient permissions");
  }
}

/**
 * Confirm the target team_id is within the caller's accessible scopes.
 * Global roles pass automatically via getAccessibleScopes.
 */
export async function requireTeamScope(
  adminId: string,
  teamId: string | null,
): Promise<void> {
  if (!teamId) {
    throw new AuthError("Team scope required");
  }

  const scopes = await getAccessibleScopes(adminId);

  if (!scopes.includes(teamId)) {
    throw new AuthError("Out of scope for this team");
  }
}

/**
 * Combined guard for team-scoped content mutations.
 * Enforces authentication, optional minimum role level, and team scope.
 */
export async function requireTeamScopedMutation(
  teamId: string | null,
  minLevel: number = 0,
): Promise<CurrentAdmin> {
  const admin = await requireAdmin();

  if (minLevel > 0) {
    requireRoleLevel(admin, minLevel);
  }

  await requireTeamScope(admin.id, teamId);
  return admin;
}

/** Validate CSRF on every admin mutation (except login). */
export async function requireCsrf(csrfToken: string): Promise<void> {
  await assertValidCsrf(csrfToken);
}

/** Map AuthError (and CSRF failures) to a safe client-facing message. */
export function toActionError(error: unknown): string {
  if (error instanceof AuthError) {
    return error.message;
  }

  if (error instanceof Error && error.message === "Invalid CSRF token") {
    return "Invalid CSRF token";
  }

  return "Something went wrong. Please try again.";
}
