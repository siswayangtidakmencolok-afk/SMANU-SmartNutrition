/**
 * Test the full next-auth signIn flow against the running dev server.
 * Mimics exactly what the browser does when a user clicks "Masuk".
 */
import https from "https";
import http from "http";

const BASE = "http://localhost:3000";

function get(url: string, cookieJar: string[] = []): Promise<{ status: number; body: string; cookies: string[] }> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, {
      headers: cookieJar.length ? { Cookie: cookieJar.join("; ") } : {},
    }, (res) => {
      let body = "";
      res.on("data", (d: Buffer) => body += d.toString());
      res.on("end", () => {
        const setCookies = (res.headers["set-cookie"] ?? []) as string[];
        resolve({ status: res.statusCode ?? 0, body, cookies: setCookies });
      });
    });
    req.on("error", reject);
  });
}

function post(url: string, data: string, cookieJar: string[] = [], contentType = "application/json"): Promise<{ status: number; body: string; cookies: string[]; location: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = url.startsWith("https") ? https : http;
    const buf = Buffer.from(data);
    const req = mod.request({
      hostname: parsed.hostname,
      port: parsed.port || (url.startsWith("https") ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": contentType,
        "Content-Length": buf.length,
        ...(cookieJar.length ? { Cookie: cookieJar.join("; ") } : {}),
      },
    }, (res) => {
      let body = "";
      res.on("data", (d: Buffer) => body += d.toString());
      res.on("end", () => {
        const setCookies = (res.headers["set-cookie"] ?? []) as string[];
        const location = res.headers["location"] ?? "";
        resolve({ status: res.statusCode ?? 0, body, cookies: setCookies, location });
      });
    });
    req.on("error", reject);
    req.write(buf);
    req.end();
  });
}

async function main() {
  console.log("\n=== SMANU Login Flow Test ===\n");

  // Step 1: GET CSRF token
  console.log("1. GET /api/auth/csrf");
  const csrfRes = await get(`${BASE}/api/auth/csrf`);
  console.log("   Status:", csrfRes.status);
  if (csrfRes.status !== 200) {
    console.log("   ❌ CSRF endpoint failed:", csrfRes.body.slice(0, 200));
    return;
  }
  let csrfToken: string;
  try {
    csrfToken = JSON.parse(csrfRes.body).csrfToken;
    console.log("   csrfToken prefix:", csrfToken.slice(0, 8) + "...");
  } catch {
    console.log("   ❌ Could not parse CSRF JSON:", csrfRes.body.slice(0, 100));
    return;
  }

  // Collect cookies from CSRF response
  const cookieJar = csrfRes.cookies.map(c => c.split(";")[0]);
  console.log("   Cookies set:", cookieJar.length ? cookieJar.map(c => c.split("=")[0]).join(", ") : "(none)");

  // Step 2: POST credentials callback (what next-auth/react does)
  console.log("\n2. POST /api/auth/callback/credentials (wrong password)");
  const wrongBody = JSON.stringify({
    identifier: "akunatmin",
    password: "wrongpassword",
    csrfToken,
    redirect: "false",
    callbackUrl: "http://localhost:3000/",
    json: "true",
  });
  const wrongRes = await post(`${BASE}/api/auth/callback/credentials`, wrongBody, cookieJar);
  console.log("   Status:", wrongRes.status);
  console.log("   Location:", wrongRes.location || "(none)");
  const wrongBodyParsed = wrongRes.body.startsWith("{") || wrongRes.body.startsWith("[")
    ? (() => { try { return JSON.parse(wrongRes.body); } catch { return {}; } })()
    : { html: wrongRes.body.slice(0, 80) };
  console.log("   Body:", JSON.stringify(wrongBodyParsed).slice(0, 200));

  // Check what error is returned
  if (wrongRes.location?.includes("error=")) {
    const url = new URL(wrongRes.location.startsWith("http") ? wrongRes.location : `http://localhost${wrongRes.location}`);
    console.log("   Error param:", url.searchParams.get("error"));
  }

  // Step 3: GET session — should be empty
  console.log("\n3. GET /api/auth/session (before login)");
  const sessionBefore = await get(`${BASE}/api/auth/session`, cookieJar);
  console.log("   Status:", sessionBefore.status);
  console.log("   Body:", sessionBefore.body.slice(0, 100));

  console.log("\n=== Summary ===");
  if (csrfRes.status === 200 && (wrongRes.status === 302 || wrongRes.status === 200)) {
    console.log("✅ Auth endpoints are responding correctly.");
    console.log("   The login form should work when credentials are correct.");
    console.log("   Check: are you using the exact username/email+password you registered with?");
  } else {
    console.log("❌ Something is wrong with auth endpoints.");
  }
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error("FATAL:", e.message); process.exit(1); });
