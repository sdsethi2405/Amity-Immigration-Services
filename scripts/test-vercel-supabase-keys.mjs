import { readFileSync, unlinkSync } from "node:fs";

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

const env = loadEnv(".env.vercel.prod.check");
const url = env.NEXT_PUBLIC_SUPABASE_URL;
console.log("keys:", Object.keys(env).sort().join(", "));
console.log("url prefix:", (url || "").slice(0, 30));

const candidates = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
];

for (const name of candidates) {
  const key = env[name];
  if (!key) {
    console.log(`${name}: MISSING`);
    continue;
  }
  const res = await fetch(`${url}/rest/v1/admins?select=username&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const body = await res.text();
  const canReadAdmins = res.ok && body.includes("username");
  console.log(
    `${name}: status=${res.status} len=${key.length} prefix=${key.slice(0, 12)} adminsReadable=${canReadAdmins}`,
  );
}

try {
  unlinkSync(".env.vercel.prod.check");
  console.log("cleaned .env.vercel.prod.check");
} catch {
  // ignore
}
