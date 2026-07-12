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

const contributor = mockAdmin(ROLE_LEVEL.CONTRIBUTOR);
const editor = mockAdmin(ROLE_LEVEL.EDITOR);

expectAuthError("Contributor cannot delete", () => requireCanDelete(contributor));
expectAuthError("Contributor cannot publish", () => requireCanPublish(contributor));
expectAuthError("Contributor fails EDITOR level", () =>
  requireRoleLevel(contributor, ROLE_LEVEL.EDITOR),
);

requireCanDelete(editor);
requireCanPublish(editor);
console.log("PASS: Editor can delete and publish");
