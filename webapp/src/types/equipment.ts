import type {
  Equipment,
  Vendor,
  Availability,
  AvailabilityStatus,
  EquipmentType,
} from "../../../backend/src/types";

// Equipment detail response with vendor and availability info
export interface EquipmentDetail extends Equipment {
  vendor: Vendor;
  availability: Availability | null;
}

// Helper to get human-readable equipment type
export function getEquipmentTypeLabel(type: EquipmentType): string {
  const labels: Record<EquipmentType, string> = {
    CTL: "Compact Track Loader",
    SKID: "Skid Steer",
    EXCAVATOR: "Excavator",
    DOZER: "Dozer / Bulldozer",
    CRANE: "Crane",
    BACKHOE: "Backhoe",
    FORKLIFT: "Forklift",
    TELEHANDLER: "Telehandler",
    ROLLER: "Roller / Compactor",
    GRADER: "Motor Grader",
    LOADER: "Wheel Loader",
    DUMP_TRUCK: "Dump Truck",
    OTHER: "Other Equipment",
  };
  return labels[type] || type;
}

// Helper to get human-readable size class
export function getSizeClassLabel(sizeClass: string | null): string {
  if (!sizeClass) return "Standard";
  const labels: Record<string, string> = {
    small: "Small",
    medium: "Medium",
    large: "Large",
  };
  return labels[sizeClass] ?? "Standard";
}

// Helper to get availability status styling
export function getAvailabilityStyle(status: AvailabilityStatus): {
  label: string;
  className: string;
} {
  const styles: Record<AvailabilityStatus, { label: string; className: string }> = {
    AVAILABLE: {
      label: "Available",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    },
    LIMITED: {
      label: "Limited Availability",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    },
    UNAVAILABLE: {
      label: "Unavailable",
      className: "bg-red-500/10 text-red-600 border-red-500/30",
    },
    UNKNOWN: {
      label: "Unknown",
      className: "bg-muted text-muted-foreground border-border",
    },
  };
  return styles[status];
}

// Helper to get freshness indicator based on last updated date
export function getFreshnessIndicator(lastUpdated: string | Date): {
  label: string;
  className: string;
} {
  const updated = new Date(lastUpdated);
  const now = new Date();
  const hoursDiff = (now.getTime() - updated.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < 24) {
    return { label: "Updated today", className: "badge-fresh" };
  }
  if (hoursDiff < 72) {
    return { label: "Updated recently", className: "badge-moderate" };
  }
  return { label: "May be outdated", className: "badge-stale" };
}

// Format rate range for display
export function formatRateRange(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min === max || max === null) return `$${min}`;
  if (min === null) return `Up to $${max}`;
  return `$${min} - $${max}`;
}

// Format date for display
export function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
