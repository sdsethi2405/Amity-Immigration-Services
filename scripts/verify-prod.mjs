import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const BASE = "https://ais-project-gamma.vercel.app";
const marker = `prod-verify-${Date.now()}`;
const email = `${marker}@example.com`;

function loadLocalEnv() {
  try {
    const raw = readFileSync(
      new URL("../.env.local", import.meta.url),
      "utf8",
    );
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
  } catch {
    return {};
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.route("**/*googleapis.com/**", (route) => route.abort());
await page.route("**/*gstatic.com/**", (route) => route.abort());

const results = {
  loginOk: false,
  loginUrl: null,
  adminRobotsOnLogin: null,
  enquiryActionId: null,
  enquiryPostStatus: null,
  enquiryOk: false,
  enquiryEmail: email,
  dbConfirmed: false,
};

try {
  await page.goto(BASE + "/admin/login", {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await page.waitForSelector("#username");
  await page.waitForTimeout(1000);
  results.adminRobotsOnLogin = await page
    .locator('meta[name="robots"]')
    .getAttribute("content")
    .catch(() => null);
  await page.locator("#username").pressSequentially("owner", { delay: 10 });
  await page.locator("#password").pressSequentially("password", { delay: 10 });
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(5000);
  results.loginUrl = page.url();
  results.loginOk =
    /\/admin\/?$/.test(new URL(results.loginUrl).pathname) ||
    (/\/admin\//.test(results.loginUrl) &&
      !results.loginUrl.includes("/admin/login"));

  // Find submitEnquiry server action id from contact page chunks
  const contactHtml = await (await page.goto(BASE + "/contact", {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  })).text();
  const chunkUrls = [
    ...contactHtml.matchAll(/\/_next\/static\/chunks\/[^"']+\.js/g),
  ].map((m) => m[0]);
  let actionId = null;
  for (const path of [...new Set(chunkUrls)]) {
    const js = await (await page.request.get(BASE + path)).text();
    if (js.includes("submitEnquiry") || js.includes("enquiries")) {
      const m =
        js.match(/createServerReference\)\("([a-f0-9]{40,})"/) ||
        js.match(/createServerReference\("([a-f0-9]{40,})"/) ||
        js.match(/"([a-f0-9]{40,44})".{0,80}enquiry/i);
      if (m) {
        actionId = m[1];
        break;
      }
      const ids = [...js.matchAll(/createServerReference\("([a-f0-9]+)"/g)].map(
        (x) => x[1],
      );
      if (ids.length === 1) {
        actionId = ids[0];
        break;
      }
      if (ids.length > 0 && js.includes("submitEnquiry")) {
        // pick nearest id before submitEnquiry string if present
        const idx = js.indexOf("submitEnquiry");
        const before = js.slice(Math.max(0, idx - 500), idx);
        const near = before.match(/createServerReference\("([a-f0-9]+)"/g);
        if (near?.length) {
          actionId = near[near.length - 1].match(/"([a-f0-9]+)"/)[1];
          break;
        }
        actionId = ids[0];
        break;
      }
    }
  }
  results.enquiryActionId = actionId;

  if (actionId) {
    const payload = JSON.stringify([
      {
        name: "Production Verify",
        email,
        phone: "",
        visa_interest: "",
        message: `Automated production verification ${marker}`,
        source_page: "/contact",
      },
    ]);
    const res = await page.request.post(BASE + "/contact", {
      headers: {
        "Next-Action": actionId,
        "Content-Type": "text/plain;charset=UTF-8",
        Accept: "text/x-component",
      },
      data: payload,
    });
    results.enquiryPostStatus = res.status();
    const body = await res.text();
    results.enquiryBodySnippet = body.slice(0, 300);
    results.enquiryOk =
      res.status() === 200 &&
      (body.includes("success") || body.includes('"success":true') || body.includes("1:"));
  }

  const env = loadLocalEnv();
  if (env.SUPABASE_SERVICE_ROLE_KEY && env.NEXT_PUBLIC_SUPABASE_URL) {
    const q = new URL(
      `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/enquiries`,
    );
    q.searchParams.set("select", "id,email");
    q.searchParams.set("email", `eq.${email}`);
    q.searchParams.set("limit", "1");
    const dbRes = await fetch(q, {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    const rows = await dbRes.json();
    results.dbConfirmed = Array.isArray(rows) && rows.length > 0;
    if (results.dbConfirmed) results.enquiryOk = true;
  }
} catch (err) {
  results.fatal = String(err);
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
process.exit(results.loginOk && results.enquiryOk && results.dbConfirmed ? 0 : 1);
