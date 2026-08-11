/**
 * Pure ACL guard checks (no Supabase). Run: npx tsx scripts/verify-admin-guards.ts
 */

import {
  AuthError,
  requireCanDelete,
  requireCanPublish,
  requireRoleLevel,
} from "../lib/auth/access";
import { ROLE_LEVEL } from "../lib/auth/constants";
import type { CurrentAdmin } from "../lib/auth/types";

function mockAdmin(level: number, scope: "team" | "global" = "team"): CurrentAdmin {
  return {
    id: "00000000-0000-4000-8000-000000000099",
    username: "test",
    is_active: true,
    team_id: "a1000000-0000-4000-8000-000000000002",
    sessionId: "session",
    role: { id: "role", name: "Test", level, scope },
    team: null,
  };
}

function expectAuthError(label: string, fn: () => void) {
  try {
    fn();
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
  } catch (error) {
    if (error instanceof AuthError) {
      console.log(`PASS: ${label}`);
      return;
    }
    throw error;
  }
}

const staff = mockAdmin(ROLE_LEVEL.STAFF);
const admin = mockAdmin(ROLE_LEVEL.ADMIN);

expectAuthError("Staff cannot delete", () => requireCanDelete(staff));
expectAuthError("Staff cannot publish", () => requireCanPublish(staff));
expectAuthError("Staff fails ADMIN level", () =>
  requireRoleLevel(staff, ROLE_LEVEL.ADMIN),
);

requireCanDelete(admin);
requireCanPublish(admin);
console.log("PASS: Admin can delete and publish");
