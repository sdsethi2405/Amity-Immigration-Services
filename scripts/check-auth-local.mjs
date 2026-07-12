import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { verifyPassword } from "../lib/auth/password.ts";

function loadEnv() {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
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

const env = loadEnv();
const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);
const { data: admin, error } = await sb
  .from("admins")
  .select("password_hash, is_active")
  .eq("username", "owner")
  .single();

if (error) {
  console.log("adminFetchError", error.message);
  process.exit(1);
}

const ok = await verifyPassword("password", admin.password_hash);
console.log("passwordValid", ok, "isActive", admin.is_active);

const pub = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
const marker = `anon-rls-${Date.now()}@example.com`;
const { error: e2 } = await pub.from("enquiries").insert({
  name: "Anon RLS test",
  email: marker,
  message: "anon insert test",
  source_page: "/contact",
  status: "new",
});
console.log("anonInsert", e2?.message ?? "ok", "email", marker);
