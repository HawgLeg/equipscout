import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createHash } from "crypto";
import { prisma } from "../prisma";
import {
  LeadRequestCreateSchema,
  ContactEventCreateSchema,
  ReportCreateSchema,
  LogContactEventSchema,
} from "../types";

const leadsRouter = new Hono();
const contactEventsRouter = new Hono();
const reportsRouter = new Hono();

// Rate limiting store (in-memory for v1)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute

// Dedupe window: 30 minutes
const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

// Helper to generate hash
function hashString(str: string): string {
  return createHash("sha256").update(str).digest("hex").substring(0, 32);
}

// Helper to get 30-minute time bucket
function getTimeBucket30Min(): string {
  const now = new Date();
  const bucket = Math.floor(now.getTime() / DEDUPE_WINDOW_MS);
  return bucket.toString();
}

// Rate limiting middleware helper
function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count };
}

// POST /api/leads - Create lead request (public)
leadsRouter.post("/", zValidator("json", LeadRequestCreateSchema), async (c) => {
  const body = c.req.valid("json");

  // Verify vendor exists
  const vendor = await prisma.vendor.findUnique({
    where: { id: body.vendorId },
  });

  if (!vendor) {
    return c.json(
      { error: { message: "Vendor not found", code: "VENDOR_NOT_FOUND" } },
      404
    );
  }

  // Verify equipment exists if provided
  if (body.equipmentId) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: body.equipmentId },
    });

    if (!equipment) {
      return c.json(
        { error: { message: "Equipment not found", code: "EQUIPMENT_NOT_FOUND" } },
        404
      );
    }
  }

  const leadRequest = await prisma.leadRequest.create({
    data: {
      vendorId: body.vendorId,
      equipmentId: body.equipmentId || null,
      requesterName: body.requesterName || null,
      requesterPhone: body.requesterPhone || null,
      requesterEmail: body.requesterEmail || null,
      message: body.message || null,
      jobsiteLocationText: body.jobsiteLocationText || null,
      radius: body.radius || null,
      needDate: body.needDate || null,
    },
  });

  return c.json({ data: leadRequest }, 201);
});

// POST /api/contact-events - Track contact clicks (public) - Legacy endpoint
contactEventsRouter.post(
  "/",
  zValidator("json", ContactEventCreateSchema),
  async (c) => {
    const body = c.req.valid("json");

    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: body.vendorId },
    });

    if (!vendor) {
      return c.json(
        { error: { message: "Vendor not found", code: "VENDOR_NOT_FOUND" } },
        404
      );
    }

    // Verify equipment exists if provided
    if (body.equipmentId) {
      const equipment = await prisma.equipment.findUnique({
        where: { id: body.equipmentId },
      });

      if (!equipment) {
        return c.json(
          { error: { message: "Equipment not found", code: "EQUIPMENT_NOT_FOUND" } },
          404
        );
      }
    }

    const contactEvent = await prisma.contactEvent.create({
      data: {
        vendorId: body.vendorId,
        equipmentId: body.equipmentId || null,
        eventType: body.eventType,
        searchParamsJson: body.searchParamsJson || null,
        isBillable: true,
      },
    });

    return c.json({ data: contactEvent }, 201);
  }
);

// POST /api/log-contact-event - Enhanced contact event logging with deduplication
contactEventsRouter.post(
  "/log",
  zValidator("json", LogContactEventSchema),
  async (c) => {
    const body = c.req.valid("json");

    // Get IP and User-Agent for hashing (not storing raw values)
    const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
               c.req.header("x-real-ip") ||
               "unknown";
    const userAgent = c.req.header("user-agent") || "unknown";

    const ipHash = hashString(ip);
    const userAgentHash = hashString(userAgent);

    // Rate limiting by IP hash
    const rateLimitKey = `ip:${ipHash}`;
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return c.json(
        { error: { message: "Rate limit exceeded", code: "RATE_LIMITED" } },
        429
      );
    }

    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: body.vendorId },
    });

    if (!vendor) {
      return c.json(
        { error: { message: "Vendor not found", code: "VENDOR_NOT_FOUND" } },
        404
      );
    }

    // Generate session ID if not provided
    const sessionId = body.sessionId || hashString(`${ipHash}:${userAgentHash}:${Date.now()}`);

    // Generate dedupe key: hash(vendor_id + equipment_id + event_type + session_id + time_bucket_30min)
    const timeBucket = getTimeBucket30Min();
    const dedupeInput = `${body.vendorId}:${body.equipmentId || ""}:${body.eventType}:${sessionId}:${timeBucket}`;
    const dedupeKey = hashString(dedupeInput);

    // Check for duplicate within 30-minute window
    const existingEvent = await prisma.contactEvent.findFirst({
      where: {
        dedupeKey,
        createdAt: {
          gte: new Date(Date.now() - DEDUPE_WINDOW_MS),
        },
      },
    });

    if (existingEvent) {
      // Duplicate - don't create new billable event, but return success
      return c.json({
        data: {
          ok: true,
          billable: false,
          reason: "duplicate_within_window",
          sessionId,
        },
      });
    }

    // Create billable contact event
    const contactEvent = await prisma.contactEvent.create({
      data: {
        vendorId: body.vendorId,
        equipmentId: body.equipmentId || null,
        eventType: body.eventType,
        sessionId,
        ipHash,
        userAgentHash,
        searchLocationText: body.searchLocationText || null,
        searchRadius: body.searchRadius || null,
        needDate: body.needDate || null,
        referrer: body.referrer || null,
        isBillable: true,
        dedupeKey,
      },
    });

    return c.json({
      data: {
        ok: true,
        billable: true,
        eventId: contactEvent.id,
        sessionId,
      },
    }, 201);
  }
);

// POST /api/reports - Report outdated listing (public)
reportsRouter.post("/", zValidator("json", ReportCreateSchema), async (c) => {
  const body = c.req.valid("json");

  // Verify at least one reference is provided
  if (!body.equipmentId && !body.vendorId) {
    return c.json(
      {
        error: {
          message: "Either equipmentId or vendorId must be provided",
          code: "INVALID_REQUEST",
        },
      },
      400
    );
  }

  // Verify equipment exists if provided
  if (body.equipmentId) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: body.equipmentId },
    });

    if (!equipment) {
      return c.json(
        { error: { message: "Equipment not found", code: "EQUIPMENT_NOT_FOUND" } },
        404
      );
    }
  }

  // Verify vendor exists if provided
  if (body.vendorId) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: body.vendorId },
    });

    if (!vendor) {
      return c.json(
        { error: { message: "Vendor not found", code: "VENDOR_NOT_FOUND" } },
        404
      );
    }
  }

  const report = await prisma.report.create({
    data: {
      equipmentId: body.equipmentId || null,
      vendorId: body.vendorId || null,
      reason: body.reason || "outdated",
      status: "pending",
    },
  });

  return c.json({ data: report }, 201);
});

export { leadsRouter, contactEventsRouter, reportsRouter };
