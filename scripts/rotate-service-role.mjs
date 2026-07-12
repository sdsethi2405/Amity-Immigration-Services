/**
 * Rotate Supabase privileged access:
 * 1) Create a new sb_secret_ key via Management API
 * 2) Write it to .env.local + Vercel Production
 * 3) Optionally disable legacy JWT anon/service_role keys
 *
 * Requires SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens)
 *
 * Usage:
 *   $env:SUPABASE_ACCESS_TOKEN="sbp_..."; node scripts/rotate-service-role.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PROJECT_REF = "cwecfcjjmcinztzlhtsl";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const token = process.env.SUPABASE_ACCESS_TOKEN;

if (!token) {
  console.error(
    "Set SUPABASE_ACCESS_TOKEN first (Supabase Dashboard → Account → Access Tokens).",
  );
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};

const createRes = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys?reveal=true`,
  {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "secret",
      name: `rotated_${new Date().toISOString().slice(0, 10).replaceAll("-", "")}`,
      description: "Rotated after chat exposure of legacy service_role JWT",
    }),
  },
);

if (!createRes.ok) {
  console.error("Failed to create secret key:", createRes.status, await createRes.text());
  process.exit(1);
}

const created = await createRes.json();
const secret = created.api_key;
if (!secret || !String(secret).startsWith("sb_secret_")) {
  console.error("Create response did not include an sb_secret_ key");
  process.exit(1);
}

console.log("Created secret key id=", created.id, "prefix=", String(secret).slice(0, 16));

const url = "https://cwecfcjjmcinztzlhtsl.supabase.co";
const probe = await fetch(`${url}/rest/v1/admins?select=username&limit=1`, {
  headers: { apikey: secret, Authorization: `Bearer ${secret}` },
});
console.log("newSecretProbe=", probe.status);
if (!probe.ok) {
  console.error(await probe.text());
  process.exit(1);
}

function upsertEnvFile(path, key, value) {
  let raw = "";
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    raw = "";
  }
  const line = `${key}=${value}`;
  if (new RegExp(`^${key}=`, "m").test(raw)) {
    raw = raw.replace(new RegExp(`^${key}=.*$`, "m"), line);
  } else {
    raw = raw.endsWith("\n") || raw.length === 0 ? `${raw}${line}\n` : `${raw}\n${line}\n`;
  }
  writeFileSync(path, raw, "utf8");
}

upsertEnvFile(join(root, ".env.local"), "SUPABASE_SERVICE_ROLE_KEY", secret);
upsertEnvFile(join(root, ".env.local"), "SUPABASE_SECRET_KEY", secret);
console.log("Updated .env.local");

function vercelSet(name, value) {
  spawnSync("npx", ["vercel", "env", "rm", name, "production", "--yes"], {
    cwd: root,
    encoding: "utf8",
    shell: true,
  });
  const add = spawnSync(
    "npx",
    ["vercel", "env", "add", name, "production", "--sensitive"],
    {
      cwd: root,
      input: `${value}\n`,
      encoding: "utf8",
      shell: true,
    },
  );
  console.log(
    `vercel ${name}: status=${add.status}`,
    `${add.stdout || ""}${add.stderr || ""}`.replaceAll(value, "[redacted]").slice(0, 200),
  );
  if (add.status !== 0) process.exit(add.status ?? 1);
}

vercelSet("SUPABASE_SERVICE_ROLE_KEY", secret);
vercelSet("SUPABASE_SECRET_KEY", secret);

const disableLegacy = process.env.DISABLE_LEGACY_KEYS === "1";
if (disableLegacy) {
  const legacyRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys/legacy?enabled=false`,
    { method: "PUT", headers },
  );
  console.log("disableLegacy=", legacyRes.status, await legacyRes.text());
  if (!legacyRes.ok) process.exit(1);
} else {
  console.log(
    "Legacy JWT keys left enabled. Re-run with DISABLE_LEGACY_KEYS=1 after switching NEXT_PUBLIC anon to publishable if desired.",
  );
}

console.log("Rotation complete. Redeploy production to pick up new env.");
