import { Hono, type Context, type Next } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";

// Type for Hono context with auth variables
type AuthVariables = {
  user: { id: string; email: string; name: string; role: string } | null;
  session: { id: string; userId: string } | null;
};

const adminRouter = new Hono<{ Variables: AuthVariables }>();

// Admin middleware - requires admin role
const requireAdmin = async (
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
  if (user.role !== "admin") {
    return c.json(
      { error: { message: "Admin access required", code: "FORBIDDEN" } },
      403
    );
  }
  await next();
};

// Apply admin middleware to all routes
adminRouter.use("*", requireAdmin);

// GET /api/admin/vendors - List all vendors
adminRouter.get("/vendors", async (c) => {
  const user = c.get("user");

  const vendors = await prisma.vendor.findMany({
    include: {
      _count: {
        select: {
          equipment: true,
          leadRequests: true,
          contactEvents: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: user?.id,
      action: "admin_action",
      details: "Listed all vendors",
    },
  });

  return c.json({ data: vendors });
});

// PUT /api/admin/vendors/:id - Update vendor (sponsor flag, etc)
const VendorAdminUpdateSchema = z.object({
  isSponsored: z.boolean().optional(),
  isActive: z.boolean().optional(),
  planStatus: z.enum(["free", "pro", "enterprise"]).optional(),
  billingStatus: z.enum(["ACTIVE", "PAUSED", "OPTED_OUT"]).optional(),
  adminNotes: z.string().nullable().optional(),
  lastContactedAt: z.string().datetime().nullable().optional(),
});

adminRouter.put(
  "/vendors/:id",
  zValidator("json", VendorAdminUpdateSchema),
  async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const vendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor) {
      return c.json(
        { error: { message: "Vendor not found", code: "NOT_FOUND" } },
        404
      );
    }

    const updated = await prisma.vendor.update({
      where: { id },
      data: body,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        vendorId: id,
        userId: user?.id,
        action: "admin_action",
        details: `Admin updated vendor ${id}: ${JSON.stringify(body)}`,
      },
    });

    return c.json({ data: updated });
  }
);

// GET /api/admin/analytics - Get admin analytics
adminRouter.get("/analytics", async (c) => {
  const user = c.get("user");

  const [
    totalVendors,
    activeVendors,
    totalEquipment,
    totalLeads,
    totalContactEvents,
    pendingReports,
  ] = await Promise.all([
    prisma.vendor.count(),
    prisma.vendor.count({ where: { isActive: true } }),
    prisma.equipment.count(),
    prisma.leadRequest.count(),
    prisma.contactEvent.count(),
    prisma.report.count({ where: { status: "pending" } }),
  ]);

  const analytics = {
    totalVendors,
    activeVendors,
    totalEquipment,
    totalLeads,
    totalContactEvents,
    pendingReports,
  };

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: user?.id,
      action: "admin_action",
      details: "Viewed admin analytics",
    },
  });

  return c.json({ data: analytics });
});

// GET /api/admin/reports - Get pending reports
const ReportsQuerySchema = z.object({
  status: z.enum(["pending", "reviewed", "dismissed"]).optional(),
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});

adminRouter.get("/reports", zValidator("query", ReportsQuerySchema), async (c) => {
  const user = c.get("user");
  const params = c.req.valid("query");

  const where: Prisma.ReportWhereInput = {};
  if (params.status) {
    where.status = params.status;
  }

  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: params.limit,
    skip: params.offset,
  });

  // Enrich reports with equipment and vendor data
  const enrichedReports = await Promise.all(
    reports.map(async (report) => {
      let equipmentTitle: string | null = null;
      let vendorName: string | null = null;

      if (report.equipmentId) {
        const equipment = await prisma.equipment.findUnique({
          where: { id: report.equipmentId },
          include: { vendor: true },
        });
        if (equipment) {
          equipmentTitle = `${equipment.type} ${equipment.make || ""} ${equipment.model || ""}`.trim();
          vendorName = equipment.vendor.name;
        }
      } else if (report.vendorId) {
        const vendor = await prisma.vendor.findUnique({
          where: { id: report.vendorId },
        });
        if (vendor) {
          vendorName = vendor.name;
        }
      }

      return {
        ...report,
        equipmentTitle,
        vendorName,
        description: null,
        reporterEmail: null,
      };
    })
  );

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: user?.id,
      action: "admin_action",
      details: `Listed reports with status: ${params.status || "all"}`,
    },
  });

  return c.json({ data: enrichedReports });
});

// PUT /api/admin/reports/:id - Update report status
const ReportUpdateSchema = z.object({
  status: z.enum(["pending", "reviewed", "dismissed"]),
});

adminRouter.put(
  "/reports/:id",
  zValidator("json", ReportUpdateSchema),
  async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return c.json(
        { error: { message: "Report not found", code: "NOT_FOUND" } },
        404
      );
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status: body.status,
        reviewedAt: body.status !== "pending" ? new Date() : null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user?.id,
        action: "admin_action",
        details: `Updated report ${id} status to ${body.status}`,
      },
    });

    return c.json({ data: updated });
  }
);

// GET /api/admin/billing - Get billing analytics for all vendors
adminRouter.get("/billing", async (c) => {
  const user = c.get("user");

  // Get start of current week (Sunday) and month
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all vendors (not just active) with their billing settings
  const vendors = await prisma.vendor.findMany({
    include: {
      billing: true,
    },
    orderBy: { name: "asc" },
  });

  // Get all billable contact events for current week and month
  // Only count events for ACTIVE billing status vendors
  const activeVendorIds = vendors
    .filter((v) => v.billingStatus === "ACTIVE")
    .map((v) => v.id);

  const [weekEvents, monthEvents] = await Promise.all([
    prisma.contactEvent.findMany({
      where: {
        isBillable: true,
        createdAt: { gte: startOfWeek },
      },
      select: {
        vendorId: true,
        eventType: true,
      },
    }),
    prisma.contactEvent.findMany({
      where: {
        isBillable: true,
        createdAt: { gte: startOfMonth },
      },
      select: {
        vendorId: true,
        eventType: true,
      },
    }),
  ]);

  // Group events by vendor
  const weekEventsByVendor = new Map<string, { total: number; call: number; text: number; email: number; website: number; request: number }>();
  const monthEventsByVendor = new Map<string, { total: number; call: number; text: number; email: number; website: number; request: number }>();

  const emptyStats = () => ({ total: 0, call: 0, text: 0, email: 0, website: 0, request: 0 });

  for (const event of weekEvents) {
    const stats = weekEventsByVendor.get(event.vendorId) || emptyStats();
    stats.total++;
    const eventKey = event.eventType.toLowerCase() as keyof typeof stats;
    if (eventKey in stats && eventKey !== "total") {
      (stats[eventKey] as number)++;
    }
    weekEventsByVendor.set(event.vendorId, stats);
  }

  for (const event of monthEvents) {
    const stats = monthEventsByVendor.get(event.vendorId) || emptyStats();
    stats.total++;
    const eventKey = event.eventType.toLowerCase() as keyof typeof stats;
    if (eventKey in stats && eventKey !== "total") {
      (stats[eventKey] as number)++;
    }
    monthEventsByVendor.set(event.vendorId, stats);
  }

  // Build billing analytics for each vendor
  const billingData = vendors.map((vendor) => {
    const cpcRate = vendor.billing?.cpcRate ?? 15;
    const thisWeek = weekEventsByVendor.get(vendor.id) || emptyStats();
    const thisMonth = monthEventsByVendor.get(vendor.id) || emptyStats();

    // Only calculate amount due for active vendors
    const amountDue = vendor.billingStatus === "ACTIVE" ? thisMonth.total * cpcRate : 0;

    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      cpcRate,
      billingStatus: vendor.billingStatus,
      onboardingDate: vendor.onboardingDate.toISOString(),
      lastContactedAt: vendor.lastContactedAt?.toISOString() || null,
      adminNotes: vendor.adminNotes,
      thisWeek,
      thisMonth,
      amountDueThisMonth: amountDue,
    };
  });

  // Calculate totals (only for active vendors)
  const activeWeekEvents = weekEvents.filter((e) => activeVendorIds.includes(e.vendorId));
  const activeMonthEvents = monthEvents.filter((e) => activeVendorIds.includes(e.vendorId));

  const totals = {
    totalBillableThisWeek: activeWeekEvents.length,
    totalBillableThisMonth: activeMonthEvents.length,
    totalRevenue: billingData
      .filter((v) => v.billingStatus === "ACTIVE")
      .reduce((sum, v) => sum + v.amountDueThisMonth, 0),
  };

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: user?.id,
      action: "admin_action",
      details: "Viewed billing analytics",
    },
  });

  return c.json({
    data: {
      vendors: billingData,
      totals,
      period: {
        weekStart: startOfWeek.toISOString(),
        monthStart: startOfMonth.toISOString(),
      },
    },
  });
});

// PUT /api/admin/billing/:vendorId - Update vendor CPC rate
const BillingUpdateSchema = z.object({
  cpcRate: z.number().min(0),
});

adminRouter.put(
  "/billing/:vendorId",
  zValidator("json", BillingUpdateSchema),
  async (c) => {
    const user = c.get("user");
    const vendorId = c.req.param("vendorId");
    const body = c.req.valid("json");

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return c.json(
        { error: { message: "Vendor not found", code: "NOT_FOUND" } },
        404
      );
    }

    // Upsert billing record
    const billing = await prisma.vendorBilling.upsert({
      where: { vendorId },
      create: {
        vendorId,
        cpcRate: body.cpcRate,
      },
      update: {
        cpcRate: body.cpcRate,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        vendorId,
        userId: user?.id,
        action: "admin_action",
        details: `Updated CPC rate for vendor ${vendorId} to $${body.cpcRate}`,
      },
    });

    return c.json({ data: billing });
  }
);

// GET /api/admin/login-attempts - Get recent failed login attempts
const LoginAttemptsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(500).default(100),
  email: z.string().optional(),
  successOnly: z.coerce.boolean().optional(),
  failedOnly: z.coerce.boolean().optional(),
});

adminRouter.get(
  "/login-attempts",
  zValidator("query", LoginAttemptsQuerySchema),
  async (c) => {
    const user = c.get("user");
    const params = c.req.valid("query");

    const where: Prisma.LoginAttemptWhereInput = {};

    if (params.email) {
      where.email = params.email.toLowerCase();
    }

    if (params.successOnly) {
      where.success = true;
    } else if (params.failedOnly) {
      where.success = false;
    }

    const attempts = await prisma.loginAttempt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: params.limit,
    });

    // Get summary statistics
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [failedLastHour, failedLastDay, totalFailed] = await Promise.all([
      prisma.loginAttempt.count({
        where: { success: false, createdAt: { gte: oneHourAgo } },
      }),
      prisma.loginAttempt.count({
        where: { success: false, createdAt: { gte: oneDayAgo } },
      }),
      prisma.loginAttempt.count({
        where: { success: false },
      }),
    ]);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user?.id,
        action: "admin_action",
        details: "Viewed login attempts",
      },
    });

    return c.json({
      data: {
        attempts,
        summary: {
          failedLastHour,
          failedLastDay,
          totalFailed,
        },
      },
    });
  }
);

export { adminRouter };
