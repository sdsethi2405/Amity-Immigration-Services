import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
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
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error("Local URL or anon key missing");
  process.exit(1);
}

const r1 = await fetch(`${url}/rest/v1/site_settings?select=key&limit=1`, {
  headers: { apikey: anon, Authorization: `Bearer ${anon}` },
});
console.log("localAnon site_settings", r1.status);

const email = `local-anon-verify-${Date.now()}@example.com`;
const r2 = await fetch(`${url}/rest/v1/enquiries`, {
  method: "POST",
  headers: {
    apikey: anon,
    Authorization: `Bearer ${anon}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  },
  body: JSON.stringify({
    name: "Local anon verify",
    email,
    message: "verify",
    source_page: "/contact",
    status: "new",
  }),
});
console.log("localAnon enquiry insert", r2.status);

for (const [k, value] of [
  ["NEXT_PUBLIC_SUPABASE_URL", url],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", anon],
]) {
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
  console.log(`vercel add ${k}: status=${add.status}`);
  console.log(
    `${add.stdout || ""}${add.stderr || ""}`
      .replaceAll(value, "[redacted]")
      .slice(0, 300),
  );
  if (add.status !== 0) process.exit(add.status ?? 1);
}

console.log("public keys synced");
