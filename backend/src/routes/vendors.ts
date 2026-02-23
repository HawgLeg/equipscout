import { Hono, type Context, type Next } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../prisma";
import { auth } from "../auth";
import { VendorSignupSchema } from "../types";

// Type for Hono context with auth variables
type AuthVariables = {
  user: { id: string; email: string; name: string; role: string } | null;
  session: { id: string; userId: string } | null;
};

const vendorsRouter = new Hono<{ Variables: AuthVariables }>();

// POST /api/vendors/signup - Create vendor account with email/password auth
vendorsRouter.post(
  "/signup",
  zValidator("json", VendorSignupSchema),
  async (c) => {
    const body = c.req.valid("json");

    try {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existingUser) {
        return c.json(
          { error: { message: "Email already registered", code: "EMAIL_EXISTS" } },
          400
        );
      }

      // Create user through Better Auth's signup
      const signUpResponse = await auth.api.signUpEmail({
        body: {
          email: body.email,
          password: body.password,
          name: body.name,
        },
      });

      if (!signUpResponse || !signUpResponse.user) {
        return c.json(
          { error: { message: "Failed to create account", code: "SIGNUP_FAILED" } },
          500
        );
      }

      // Create vendor profile linked to user
      const vendor = await prisma.vendor.create({
        data: {
          userId: signUpResponse.user.id,
          name: body.vendorName,
          phone: body.phone,
          email: body.email,
          website: body.website || null,
          yardAddress: body.yardAddress,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          vendorId: vendor.id,
          userId: signUpResponse.user.id,
          action: "signup",
          details: `New vendor account created: ${body.vendorName}`,
        },
      });

      return c.json({
        data: {
          user: signUpResponse.user,
          vendor,
        },
      });
    } catch (error) {
      console.error("Vendor signup error:", error);
      return c.json(
        { error: { message: "Signup failed", code: "SIGNUP_ERROR" } },
        500
      );
    }
  }
);

// Auth middleware for protected routes
const requireAuth = async (
  c: Context<{ Variables: AuthVariables }>,
  next: Next
) => {
  const user = c.get("user");
  if (!user) {
    return c.json(
      { error: { message: "Authentication required", code: "UNAUTHORIZED" } },
      401
    );
  }
  await next();
};

// GET /api/vendors/me - Get current vendor profile
vendorsRouter.get("/me", requireAuth, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json(
      { error: { message: "Authentication required", code: "UNAUTHORIZED" } },
      401
    );
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: user.id },
    include: {
      equipment: {
        include: { availability: true },
      },
    },
  });

  if (!vendor) {
    return c.json(
      { error: { message: "Vendor profile not found", code: "VENDOR_NOT_FOUND" } },
      404
    );
  }

  return c.json({ data: vendor });
});

// PUT /api/vendors/me - Update vendor profile
const VendorUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  website: z.string().url().nullable().optional(),
  yardAddress: z.string().min(1).optional(),
  yardLat: z.number().optional(),
  yardLng: z.number().optional(),
});

vendorsRouter.put(
  "/me",
  requireAuth,
  zValidator("json", VendorUpdateSchema),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json(
        { error: { message: "Authentication required", code: "UNAUTHORIZED" } },
        401
      );
    }

    const body = c.req.valid("json");

    const vendor = await prisma.vendor.findUnique({
      where: { userId: user.id },
    });

    if (!vendor) {
      return c.json(
        { error: { message: "Vendor profile not found", code: "VENDOR_NOT_FOUND" } },
        404
      );
    }

    const updated = await prisma.vendor.update({
      where: { id: vendor.id },
      data: body,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        vendorId: vendor.id,
        userId: user.id,
        action: "listing_edit",
        details: `Vendor profile updated: ${JSON.stringify(body)}`,
      },
    });

    return c.json({ data: updated });
  }
);

// GET /api/vendors/me/analytics - Get vendor analytics
vendorsRouter.get("/me/analytics", requireAuth, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json(
      { error: { message: "Authentication required", code: "UNAUTHORIZED" } },
      401
    );
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: user.id },
    include: { billing: true },
  });

  if (!vendor) {
    return c.json(
      { error: { message: "Vendor profile not found", code: "VENDOR_NOT_FOUND" } },
      404
    );
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get start of current week (Sunday) and month
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all-time contact events
  const allContactEvents = await prisma.contactEvent.findMany({
    where: { vendorId: vendor.id },
  });

  // Get all-time lead requests
  const allLeadRequests = await prisma.leadRequest.count({
    where: { vendorId: vendor.id },
  });

  // Get last 30 days contact events
  const recentContactEvents = await prisma.contactEvent.count({
    where: {
      vendorId: vendor.id,
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  // Get last 30 days lead requests
  const recentLeadRequests = await prisma.leadRequest.count({
    where: {
      vendorId: vendor.id,
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  // Get billable events for this week and month
  const [weekBillableEvents, monthBillableEvents] = await Promise.all([
    prisma.contactEvent.count({
      where: {
        vendorId: vendor.id,
        isBillable: true,
        createdAt: { gte: startOfWeek },
      },
    }),
    prisma.contactEvent.count({
      where: {
        vendorId: vendor.id,
        isBillable: true,
        createdAt: { gte: startOfMonth },
      },
    }),
  ]);

  // Count by event type
  const callClicks = allContactEvents.filter((e) => e.eventType === "CALL").length;
  const textClicks = allContactEvents.filter((e) => e.eventType === "TEXT").length;
  const emailClicks = allContactEvents.filter((e) => e.eventType === "EMAIL").length;
  const websiteClicks = allContactEvents.filter((e) => e.eventType === "WEBSITE").length;

  // CPC rate (default $15)
  const cpcRate = vendor.billing?.cpcRate ?? 15;

  const analytics = {
    totalContactClicks: allContactEvents.length,
    callClicks,
    textClicks,
    emailClicks,
    websiteClicks,
    leadRequests: allLeadRequests,
    last30Days: {
      contactClicks: recentContactEvents,
      leadRequests: recentLeadRequests,
    },
    billing: {
      cpcRate,
      thisWeekBillable: weekBillableEvents,
      thisMonthBillable: monthBillableEvents,
      estimatedChargeThisMonth: monthBillableEvents * cpcRate,
    },
  };

  return c.json({ data: analytics });
});

export { vendorsRouter };
