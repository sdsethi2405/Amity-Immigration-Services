#!/usr/bin/env tsx
/**
 * Create the first (or additional) admin account.
 * Usage: pnpm create-admin
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

import { createInterface } from "node:readline/promises";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { stdin as input, stdout as output } from "node:process";

import { createClient } from "@supabase/supabase-js";

import { hashPassword } from "../lib/auth/password";

type RoleRow = {
  id: string;
  name: string;
  level: number;
  scope: "team" | "global";
};

type TeamRow = {
  id: string;
  name: string;
  slug: string;
};

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function loadEnv(): void {
  const root = resolve(import.meta.dirname, "..");

  for (const file of [".env.local", ".env.development.local", ".env"]) {
    loadEnvFile(resolve(root, file));
  }
}

async function promptPassword(rl: ReturnType<typeof createInterface>): Promise<string> {
  const password = await rl.question("Password: ");

  if (password.length < 12) {
    throw new Error("Password must be at least 12 characters");
  }

  const confirm = await rl.question("Confirm password: ");

  if (password !== confirm) {
    throw new Error("Passwords do not match");
  }

  return password;
}

async function main(): Promise<void> {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment",
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: roles, error: rolesError } = await supabase
    .from("roles")
    .select("id, name, level, scope")
    .order("level", { ascending: false });

  if (rolesError) throw rolesError;

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name, slug")
    .order("name");

  if (teamsError) throw teamsError;

  const rl = createInterface({ input, output });

  try {
    console.log("\nAmity Admin — create account\n");

    const username = (await rl.question("Username: ")).trim().toLowerCase();

    if (!username) {
      throw new Error("Username is required");
    }

    const password = await promptPassword(rl);

    console.log("\nRoles:");
    (roles as RoleRow[]).forEach((role, index) => {
      console.log(
        `  ${index + 1}. ${role.name} (level ${role.level}, ${role.scope})`,
      );
    });

    const roleChoice = Number.parseInt(
      await rl.question("Select role number: "),
      10,
    );
    const selectedRole = (roles as RoleRow[])[roleChoice - 1];

    if (!selectedRole) {
      throw new Error("Invalid role selection");
    }

    let teamId: string | null = null;

    if (selectedRole.scope === "team") {
      console.log("\nTeams:");
      (teams as TeamRow[]).forEach((team, index) => {
        console.log(`  ${index + 1}. ${team.name} (${team.slug})`);
      });

      const teamChoice = Number.parseInt(
        await rl.question("Select team number: "),
        10,
      );
      const selectedTeam = (teams as TeamRow[])[teamChoice - 1];

      if (!selectedTeam) {
        throw new Error("Invalid team selection");
      }

      teamId = selectedTeam.id;
    }

    const passwordHash = await hashPassword(password);

    const { data: admin, error: insertError } = await supabase
      .from("admins")
      .insert({
        username,
        password_hash: passwordHash,
        role_id: selectedRole.id,
        team_id: teamId,
        is_active: true,
      })
      .select("id, username")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        throw new Error("Username already exists");
      }

      throw insertError;
    }

    console.log(`\nAdmin created: ${admin.username} (${admin.id})\n`);
  } finally {
    rl.close();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`\nError: ${message}\n`);
  process.exit(1);
});
