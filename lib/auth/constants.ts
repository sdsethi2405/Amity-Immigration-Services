/** Session cookie holding the raw token (never stored in DB). */
export const SESSION_COOKIE_NAME = "amity_session";

/** CSRF double-submit cookie (signed). */
export const CSRF_COOKIE_NAME = "amity_csrf";

/** Default session lifetime: 8 hours. */
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export const INVALID_CREDENTIALS_MESSAGE = "invalid username or password";

/** Role levels seeded in the database. */
export const ROLE_LEVEL = {
  CONTRIBUTOR: 20,
  EDITOR: 50,
  HEAD_ADMIN: 100,
} as const;

/** Minimum role level required for destructive deletes. */
export const DELETE_MIN_LEVEL = ROLE_LEVEL.EDITOR;

/** Minimum role level required to publish or unpublish content. */
export const PUBLISH_MIN_LEVEL = ROLE_LEVEL.EDITOR;

/** Minimum role level for admins, roles, teams, and site_settings management. */
export const ADMIN_MANAGEMENT_MIN_LEVEL = ROLE_LEVEL.HEAD_ADMIN;

/** Per-username lockout duration when rate limit is exceeded. */
export const USERNAME_LOCKOUT_MINUTES = 15;

/** Team-scoped content tables that require scope checks on mutation. */
export const TEAM_SCOPED_TABLES = [
  "pages",
  "services",
  "visa_subclasses",
  "posts",
  "team_members",
] as const;

export type TeamScopedTable = (typeof TEAM_SCOPED_TABLES)[number];
