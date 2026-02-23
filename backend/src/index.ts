import "@vibecodeapp/proxy"; // DO NOT REMOVE OTHERWISE VIBECODE PROXY WILL NOT WORK
// Email verification enabled with Resend
import { Hono } from "hono";
import { cors } from "hono/cors";
import "./env";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { logLoginAttempt } from "./loginAttempts";

// Import routes
import { searchRouter } from "./routes/search";
import { vendorsRouter } from "./routes/vendors";
import { equipmentRouter, vendorEquipmentRouter } from "./routes/equipment";
import { leadsRouter, contactEventsRouter, reportsRouter } from "./routes/leads";
import { adminRouter } from "./routes/admin";

// Type for auth variables
type AuthVariables = {
  user: { id: string; email: string; name: string; role: string } | null;
  session: { id: string; userId: string } | null;
};

const app = new Hono<{ Variables: AuthVariables }>();

// CORS middleware - validates origin against allowlist
const allowed = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/[a-z0-9-]+\.dev\.vibecode\.run$/,
  /^https:\/\/[a-z0-9-]+\.vibecode\.run$/,
  /^https:\/\/[a-z0-9-]+\.vibecodeapp\.com$/,
  /^https:\/\/[a-z0-9-]+\.vibecode\.dev$/,
  /^https:\/\/vibecode\.dev$/,
];

app.use(
  "*",
  cors({
    origin: (origin) => (origin && allowed.some((re) => re.test(origin)) ? origin : null),
    credentials: true,
  })
);

// Logging
app.use("*", logger());

// Auth middleware - populates user/session for all routes
app.use("*", async (c, next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (session?.user) {
      c.set("user", session.user as AuthVariables["user"]);
      c.set("session", session.session as AuthVariables["session"]);
    } else {
      c.set("user", null);
      c.set("session", null);
    }
  } catch (error) {
    c.set("user", null);
    c.set("session", null);
  }

  await next();
});

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }));

// Mount Better Auth handler at /api/auth/* with failed login tracking
app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const url = new URL(c.req.url);
  const isSignInAttempt = url.pathname.endsWith("/sign-in/email");

  // Capture email before processing for failed login tracking
  let email: string | undefined;
  if (isSignInAttempt && c.req.method === "POST") {
    try {
      const clonedReq = c.req.raw.clone();
      const body = (await clonedReq.json()) as { email?: string };
      email = body?.email;
    } catch {
      // Ignore parsing errors
    }
  }

  const response = await auth.handler(c.req.raw);

  // Log failed login attempts
  if (isSignInAttempt && email) {
    const isSuccess = response.headers.get("set-cookie")?.includes("better-auth.session_token") ?? false;
    if (!isSuccess) {
      const ipAddress = c.req.header("x-forwarded-for")?.split(",")[0] || c.req.header("x-real-ip");
      const userAgent = c.req.header("user-agent");

      await logLoginAttempt({
        email,
        success: false,
        ipAddress,
        userAgent,
      });
    }
  }

  return response;
});

// Mount routes
app.route("/api/search", searchRouter);
app.route("/api/vendors", vendorsRouter);
app.route("/api/vendors/me/equipment", vendorEquipmentRouter);
app.route("/api/equipment", equipmentRouter);
app.route("/api/leads", leadsRouter);
app.route("/api/contact-events", contactEventsRouter);
app.route("/api/reports", reportsRouter);
app.route("/api/admin", adminRouter);

const port = Number(process.env.PORT) || 3000;

export default {
  port,
  fetch: app.fetch,
};
