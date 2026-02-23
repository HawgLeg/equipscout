import { Hono, type Context, type Next } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import {
  EquipmentCreateSchema,
  AvailabilityUpdateSchema,
} from "../types";

// Type for Hono context with auth variables
type AuthVariables = {
  user: { id: string; email: string; name: string; role: string } | null;
  session: { id: string; userId: string } | null;
};

// Equipment router for public routes (mounted at /api/equipment)
const equipmentRouter = new Hono<{ Variables: AuthVariables }>();

// Vendor equipment router for authenticated routes (mounted at /api/vendors/me/equipment)
const vendorEquipmentRouter = new Hono<{ Variables: AuthVariables }>();

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

// Apply auth to all vendor equipment routes
vendorEquipmentRouter.use("*", requireAuth);

// Helper to get vendor for current user
async function getVendorForUser(userId: string) {
  return prisma.vendor.findUnique({
    where: { userId },
  });
}

// GET /api/equipment/:id - Get single equipment listing with vendor info
equipmentRouter.get("/:id", async (c) => {
  const id = c.req.param("id");

  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: {
      vendor: true,
      availability: true,
    },
  });

  if (!equipment) {
    return c.json(
      { error: { message: "Equipment not found", code: "NOT_FOUND" } },
      404
    );
  }

  return c.json({ data: equipment });
});

// GET /api/vendors/me/equipment - Get vendor's equipment
vendorEquipmentRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json(
      { error: { message: "Authentication required", code: "UNAUTHORIZED" } },
      401
    );
  }

  const vendor = await getVendorForUser(user.id);
  if (!vendor) {
    return c.json(
      { error: { message: "Vendor profile not found", code: "VENDOR_NOT_FOUND" } },
      404
    );
  }

  const equipment = await prisma.equipment.findMany({
    where: { vendorId: vendor.id },
    include: { availability: true },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ data: equipment });
});

// POST /api/vendors/me/equipment - Create equipment
vendorEquipmentRouter.post(
  "/",
  zValidator("json", EquipmentCreateSchema),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json(
        { error: { message: "Authentication required", code: "UNAUTHORIZED" } },
        401
      );
    }

    const body = c.req.valid("json");

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return c.json(
        { error: { message: "Vendor profile not found", code: "VENDOR_NOT_FOUND" } },
        404
      );
    }

    // Create equipment with initial availability
    const equipment = await prisma.equipment.create({
      data: {
        vendorId: vendor.id,
        ...body,
        availability: {
          create: {
            status: "UNKNOWN",
          },
        },
      },
      include: { availability: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        vendorId: vendor.id,
        userId: user.id,
        action: "listing_edit",
        details: `Equipment created: ${equipment.type} ${equipment.make || ""} ${equipment.model || ""}`,
      },
    });

    return c.json({ data: equipment }, 201);
  }
);

// PUT /api/vendors/me/equipment/:id - Update equipment
const EquipmentUpdateSchema = EquipmentCreateSchema.partial();

vendorEquipmentRouter.put(
  "/:id",
  zValidator("json", EquipmentUpdateSchema),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json(
        { error: { message: "Authentication required", code: "UNAUTHORIZED" } },
        401
      );
    }

    const id = c.req.param("id");
    const body = c.req.valid("json");

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return c.json(
        { error: { message: "Vendor profile not found", code: "VENDOR_NOT_FOUND" } },
        404
      );
    }

    // Check equipment belongs to vendor
    const existing = await prisma.equipment.findFirst({
      where: { id, vendorId: vendor.id },
    });

    if (!existing) {
      return c.json(
        { error: { message: "Equipment not found", code: "NOT_FOUND" } },
        404
      );
    }

    const updated = await prisma.equipment.update({
      where: { id },
      data: body,
      include: { availability: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        vendorId: vendor.id,
        userId: user.id,
        action: "listing_edit",
        details: `Equipment updated: ${id} - ${JSON.stringify(body)}`,
      },
    });

    return c.json({ data: updated });
  }
);

// DELETE /api/vendors/me/equipment/:id - Delete equipment
vendorEquipmentRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json(
      { error: { message: "Authentication required", code: "UNAUTHORIZED" } },
      401
    );
  }

  const id = c.req.param("id");

  const vendor = await getVendorForUser(user.id);
  if (!vendor) {
    return c.json(
      { error: { message: "Vendor profile not found", code: "VENDOR_NOT_FOUND" } },
      404
    );
  }

  // Check equipment belongs to vendor
  const existing = await prisma.equipment.findFirst({
    where: { id, vendorId: vendor.id },
  });

  if (!existing) {
    return c.json(
      { error: { message: "Equipment not found", code: "NOT_FOUND" } },
      404
    );
  }

  await prisma.equipment.delete({
    where: { id },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      vendorId: vendor.id,
      userId: user.id,
      action: "listing_edit",
      details: `Equipment deleted: ${id}`,
    },
  });

  return c.json({ data: { success: true } });
});

// PUT /api/vendors/me/equipment/:id/availability - Update availability
vendorEquipmentRouter.put(
  "/:id/availability",
  zValidator("json", AvailabilityUpdateSchema),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json(
        { error: { message: "Authentication required", code: "UNAUTHORIZED" } },
        401
      );
    }

    const id = c.req.param("id");
    const body = c.req.valid("json");

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return c.json(
        { error: { message: "Vendor profile not found", code: "VENDOR_NOT_FOUND" } },
        404
      );
    }

    // Check equipment belongs to vendor
    const existing = await prisma.equipment.findFirst({
      where: { id, vendorId: vendor.id },
      include: { availability: true },
    });

    if (!existing) {
      return c.json(
        { error: { message: "Equipment not found", code: "NOT_FOUND" } },
        404
      );
    }

    // Upsert availability
    const availability = await prisma.availability.upsert({
      where: { equipmentId: id },
      create: {
        equipmentId: id,
        status: body.status,
        earliestDate: body.earliestDate ? new Date(body.earliestDate) : null,
        lastUpdated: new Date(),
      },
      update: {
        status: body.status,
        earliestDate: body.earliestDate ? new Date(body.earliestDate) : null,
        lastUpdated: new Date(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        vendorId: vendor.id,
        userId: user.id,
        action: "listing_edit",
        details: `Availability updated for equipment ${id}: ${body.status}`,
      },
    });

    return c.json({ data: availability });
  }
);

export { equipmentRouter, vendorEquipmentRouter };
