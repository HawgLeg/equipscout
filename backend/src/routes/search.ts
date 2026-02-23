import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import {
  EquipmentTypeSchema,
  NeedDateSchema,
  type SearchResult,
} from "../types";

const searchRouter = new Hono();

// Haversine distance calculation (returns miles)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Availability priority for sorting
const availabilityPriority: Record<string, number> = {
  AVAILABLE: 0,
  LIMITED: 1,
  UNKNOWN: 2,
  UNAVAILABLE: 3,
};

// Query schema for search params
const SearchQuerySchema = z.object({
  equipmentType: EquipmentTypeSchema.optional(),
  location: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().default(40),
  needDate: NeedDateSchema.default("any"),
  maxDayRate: z.coerce.number().optional(),
  availableOnly: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

// GET /api/search - Search equipment with filters
searchRouter.get("/", zValidator("query", SearchQuerySchema), async (c) => {
  const params = c.req.valid("query");

  // Build query conditions
  const whereConditions: Prisma.EquipmentWhereInput = {
    vendor: {
      isActive: true,
    },
  };

  // Filter by equipment type
  if (params.equipmentType) {
    whereConditions.type = params.equipmentType;
  }

  // Filter by max day rate
  if (params.maxDayRate) {
    whereConditions.rateDayMin = {
      lte: params.maxDayRate,
    };
  }

  // Get equipment with vendor and availability
  const equipment = await prisma.equipment.findMany({
    where: whereConditions,
    include: {
      vendor: true,
      availability: true,
    },
  });

  // Transform to search results
  let results: SearchResult[] = equipment.map((eq) => {
    const availability = eq.availability;
    const vendor = eq.vendor;

    // Calculate distance if coordinates provided
    let distance: number | null = null;
    if (params.lat && params.lng && vendor.yardLat && vendor.yardLng) {
      distance = calculateDistance(
        params.lat,
        params.lng,
        vendor.yardLat,
        vendor.yardLng
      );
    }

    return {
      id: eq.id,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      vendorEmail: vendor.email,
      vendorWebsite: vendor.website,
      isSponsored: vendor.isSponsored,
      type: eq.type as "CTL" | "SKID" | "EXCAVATOR" | "DOZER" | "CRANE" | "BACKHOE" | "FORKLIFT" | "TELEHANDLER" | "ROLLER" | "GRADER" | "LOADER" | "DUMP_TRUCK" | "OTHER",
      sizeClass: eq.sizeClass as "small" | "medium" | "large" | null,
      make: eq.make,
      model: eq.model,
      year: eq.year,
      rateDayMin: eq.rateDayMin,
      rateDayMax: eq.rateDayMax,
      rateHourMin: eq.rateHourMin,
      rateHourMax: eq.rateHourMax,
      notes: eq.notes,
      imageUrl: eq.imageUrl,
      availabilityStatus: (availability?.status || "UNKNOWN") as
        | "AVAILABLE"
        | "LIMITED"
        | "UNAVAILABLE"
        | "UNKNOWN",
      earliestDate: availability?.earliestDate?.toISOString() || null,
      lastUpdated: availability?.lastUpdated?.toISOString() || eq.updatedAt.toISOString(),
      distance,
    };
  });

  // Filter by radius if coordinates provided
  if (params.lat && params.lng) {
    results = results.filter(
      (r) => r.distance !== null && r.distance <= params.radius
    );
  }

  // Filter by availability if availableOnly
  if (params.availableOnly) {
    results = results.filter(
      (r) => r.availabilityStatus === "AVAILABLE" || r.availabilityStatus === "LIMITED"
    );
  }

  // Sort results:
  // 1. Sponsored first
  // 2. Then by availability (AVAILABLE > LIMITED > UNKNOWN > UNAVAILABLE)
  // 3. Then by lastUpdated (recent first)
  results.sort((a, b) => {
    // Sponsored first
    if (a.isSponsored !== b.isSponsored) {
      return a.isSponsored ? -1 : 1;
    }

    // Then by availability priority
    const aPriority = availabilityPriority[a.availabilityStatus] ?? 99;
    const bPriority = availabilityPriority[b.availabilityStatus] ?? 99;
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // Then by lastUpdated (recent first)
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });

  return c.json({ data: results });
});

export { searchRouter };
