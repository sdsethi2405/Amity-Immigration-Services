const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const secret = process.env.SUPABASE_SECRET_KEY;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(
  JSON.stringify({
    urlSet: Boolean(url),
    urlLen: url?.length ?? 0,
    serviceSet: Boolean(service),
    serviceLen: service?.length ?? 0,
    servicePrefix: service?.slice(0, 12) ?? "",
    secretSet: Boolean(secret),
    secretLen: secret?.length ?? 0,
    secretPrefix: secret?.slice(0, 12) ?? "",
    anonSet: Boolean(anon),
    anonLen: anon?.length ?? 0,
  }),
);

async function probe(name, key) {
  if (!url || !key) {
    console.log(`${name}: skip`);
    return;
  }
  const res = await fetch(`${url}/rest/v1/admins?select=username&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const text = await res.text();
  console.log(
    `${name}: status=${res.status} adminsReadable=${res.ok && text.includes("username")}`,
  );
}

await probe("SERVICE_ROLE", service);
await probe("SECRET_KEY", secret);
await probe("ANON", anon);
