import { z } from "zod";

// Equipment types
export const EquipmentTypeSchema = z.enum([
  "CTL",
  "SKID",
  "EXCAVATOR",
  "DOZER",
  "CRANE",
  "BACKHOE",
  "FORKLIFT",
  "TELEHANDLER",
  "ROLLER",
  "GRADER",
  "LOADER",
  "DUMP_TRUCK",
  "OTHER"
]);
export type EquipmentType = z.infer<typeof EquipmentTypeSchema>;

export const SizeClassSchema = z.enum(["small", "medium", "large"]);
export type SizeClass = z.infer<typeof SizeClassSchema>;

export const AvailabilityStatusSchema = z.enum(["AVAILABLE", "LIMITED", "UNAVAILABLE", "UNKNOWN"]);
export type AvailabilityStatus = z.infer<typeof AvailabilityStatusSchema>;

export const NeedDateSchema = z.enum(["today", "tomorrow", "this_week", "any"]);
export type NeedDate = z.infer<typeof NeedDateSchema>;

// Vendor schemas
export const VendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  website: z.string().nullable(),
  yardAddress: z.string(),
  yardLat: z.number().nullable(),
  yardLng: z.number().nullable(),
  planStatus: z.string(),
  isSponsored: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Vendor = z.infer<typeof VendorSchema>;

export const VendorCreateSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  website: z.string().url().optional().nullable(),
  yardAddress: z.string().min(1),
  yardLat: z.number().optional(),
  yardLng: z.number().optional(),
});
export type VendorCreate = z.infer<typeof VendorCreateSchema>;

// Equipment schemas
export const EquipmentSchema = z.object({
  id: z.string(),
  vendorId: z.string(),
  type: EquipmentTypeSchema,
  sizeClass: SizeClassSchema.nullable(),
  make: z.string().nullable(),
  model: z.string().nullable(),
  year: z.number().nullable(),
  rateHourMin: z.number().nullable(),
  rateHourMax: z.number().nullable(),
  rateDayMin: z.number().nullable(),
  rateDayMax: z.number().nullable(),
  notes: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Equipment = z.infer<typeof EquipmentSchema>;

export const EquipmentCreateSchema = z.object({
  type: EquipmentTypeSchema,
  sizeClass: SizeClassSchema.optional().nullable(),
  make: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  year: z.number().optional().nullable(),
  rateHourMin: z.number().optional().nullable(),
  rateHourMax: z.number().optional().nullable(),
  rateDayMin: z.number().optional().nullable(),
  rateDayMax: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});
export type EquipmentCreate = z.infer<typeof EquipmentCreateSchema>;

// Availability schemas
export const AvailabilitySchema = z.object({
  id: z.string(),
  equipmentId: z.string(),
  status: AvailabilityStatusSchema,
  earliestDate: z.string().nullable(),
  lastUpdated: z.string().or(z.date()),
});
export type Availability = z.infer<typeof AvailabilitySchema>;

export const AvailabilityUpdateSchema = z.object({
  status: AvailabilityStatusSchema,
  earliestDate: z.string().optional().nullable(),
});
export type AvailabilityUpdate = z.infer<typeof AvailabilityUpdateSchema>;

// Search schemas
export const SearchParamsSchema = z.object({
  equipmentType: EquipmentTypeSchema.optional(),
  location: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius: z.number().default(40),
  needDate: NeedDateSchema.default("any"),
  maxDayRate: z.number().optional(),
  availableOnly: z.boolean().default(false),
});
export type SearchParams = z.infer<typeof SearchParamsSchema>;

// Search result with joined data
export const SearchResultSchema = z.object({
  id: z.string(),
  vendorId: z.string(),
  vendorName: z.string(),
  vendorPhone: z.string(),
  vendorEmail: z.string(),
  vendorWebsite: z.string().nullable(),
  isSponsored: z.boolean(),
  type: EquipmentTypeSchema,
  sizeClass: SizeClassSchema.nullable(),
  make: z.string().nullable(),
  model: z.string().nullable(),
  year: z.number().nullable(),
  rateDayMin: z.number().nullable(),
  rateDayMax: z.number().nullable(),
  rateHourMin: z.number().nullable(),
  rateHourMax: z.number().nullable(),
  notes: z.string().nullable(),
  imageUrl: z.string().nullable(),
  availabilityStatus: AvailabilityStatusSchema,
  earliestDate: z.string().nullable(),
  lastUpdated: z.string(),
  distance: z.number().nullable(),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

// Lead request schemas
export const LeadRequestCreateSchema = z.object({
  vendorId: z.string(),
  equipmentId: z.string().optional(),
  requesterName: z.string().optional(),
  requesterPhone: z.string().optional(),
  requesterEmail: z.string().email().optional(),
  message: z.string().optional(),
  jobsiteLocationText: z.string().optional(),
  radius: z.number().optional(),
  needDate: NeedDateSchema.optional(),
});
export type LeadRequestCreate = z.infer<typeof LeadRequestCreateSchema>;

// Contact event schemas
export const ContactEventTypeSchema = z.enum(["CALL", "TEXT", "EMAIL", "WEBSITE", "REQUEST"]);
export type ContactEventType = z.infer<typeof ContactEventTypeSchema>;

export const ContactEventCreateSchema = z.object({
  vendorId: z.string(),
  equipmentId: z.string().optional(),
  eventType: ContactEventTypeSchema,
  searchParamsJson: z.string().optional(),
});
export type ContactEventCreate = z.infer<typeof ContactEventCreateSchema>;

// Log contact event schema (enhanced with tracking fields)
export const LogContactEventSchema = z.object({
  vendorId: z.string(),
  equipmentId: z.string().optional(),
  eventType: ContactEventTypeSchema,
  searchLocationText: z.string().optional(),
  searchRadius: z.number().optional(),
  needDate: z.string().optional(),
  referrer: z.string().optional(),
  sessionId: z.string().optional(),
});
export type LogContactEvent = z.infer<typeof LogContactEventSchema>;

// Report schemas
export const ReportCreateSchema = z.object({
  equipmentId: z.string().optional(),
  vendorId: z.string().optional(),
  reason: z.string().default("outdated"),
});
export type ReportCreate = z.infer<typeof ReportCreateSchema>;

// Auth schemas
export const VendorSignupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  name: z.string().min(1),
  vendorName: z.string().min(1),
  phone: z.string().min(1),
  yardAddress: z.string().min(1),
  website: z.string().url().optional(),
});
export type VendorSignup = z.infer<typeof VendorSignupSchema>;

// Analytics schemas
export const VendorAnalyticsSchema = z.object({
  totalContactClicks: z.number(),
  callClicks: z.number(),
  textClicks: z.number(),
  emailClicks: z.number(),
  websiteClicks: z.number(),
  leadRequests: z.number(),
  last30Days: z.object({
    contactClicks: z.number(),
    leadRequests: z.number(),
  }),
  billing: z.object({
    cpcRate: z.number(),
    thisWeekBillable: z.number(),
    thisMonthBillable: z.number(),
    estimatedChargeThisMonth: z.number(),
  }).optional(),
});
export type VendorAnalytics = z.infer<typeof VendorAnalyticsSchema>;

// Admin analytics
export const AdminAnalyticsSchema = z.object({
  totalVendors: z.number(),
  activeVendors: z.number(),
  totalEquipment: z.number(),
  totalLeads: z.number(),
  totalContactEvents: z.number(),
  pendingReports: z.number(),
});
export type AdminAnalytics = z.infer<typeof AdminAnalyticsSchema>;

// Vendor billing analytics
export const VendorBillingAnalyticsSchema = z.object({
  vendorId: z.string(),
  vendorName: z.string(),
  cpcRate: z.number(),
  thisWeek: z.object({
    total: z.number(),
    call: z.number(),
    text: z.number(),
    email: z.number(),
    website: z.number(),
    request: z.number(),
  }),
  thisMonth: z.object({
    total: z.number(),
    call: z.number(),
    text: z.number(),
    email: z.number(),
    website: z.number(),
    request: z.number(),
  }),
  amountDueThisMonth: z.number(),
});
export type VendorBillingAnalytics = z.infer<typeof VendorBillingAnalyticsSchema>;
