import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(path) {
  const raw = readFileSync(path, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[line.slice(0, i).trim()] = v;
  }
  return env;
}

const env = loadEnv(join(root, ".env.local"));
const keys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

for (const k of keys) {
  const v = env[k] || "";
  console.log(
    `${k}: present=${Boolean(v)} len=${v.length} prefix=${v.slice(0, 14)}`,
  );
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
const res = await fetch(`${url}/rest/v1/admins?select=username&limit=1`, {
  headers: {
    apikey: service,
    Authorization: `Bearer ${service}`,
  },
});
console.log(`localServiceRoleCheck: ${res.status}`);
if (!res.ok) {
  console.error(await res.text());
  process.exit(1);
}

const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const res2 = await fetch(`${url}/rest/v1/`, {
  headers: { apikey: anon, Authorization: `Bearer ${anon}` },
});
console.log(`localAnonCheck: ${res2.status}`);

for (const k of keys) {
  const value = env[k];
  if (!value) {
    console.error(`Missing ${k}`);
    process.exit(1);
  }
  const add = spawnSync(
    "npx",
    ["vercel", "env", "add", k, "production", "--force", "--sensitive"],
    {
      cwd: root,
      input: `${value}\n`,
      encoding: "utf8",
      shell: true,
    },
  );
  const out = `${add.stdout || ""}${add.stderr || ""}`.replaceAll(value, "[redacted]");
  console.log(`vercel add ${k}: status=${add.status}`);
  console.log(out.slice(0, 400));
  if (add.status !== 0) process.exit(add.status ?? 1);
}

console.log("sync complete");
