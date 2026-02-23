import { Phone, MessageSquare, Mail, Globe, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackingApi, type ContactEventType } from "@/lib/api";
import type { SearchResult } from "../../../../backend/src/types";

interface ListingCardProps {
  result: SearchResult;
  onRequestAvailability: (result: SearchResult) => void;
  searchContext?: {
    locationText?: string;
    radius?: number;
    needDate?: string;
  };
}

function getAvailabilityDisplay(status: string) {
  switch (status) {
    case "AVAILABLE":
      return { label: "Available", dotClass: "bg-emerald-500", textClass: "text-emerald-600" };
    case "LIMITED":
      return { label: "Limited", dotClass: "bg-amber-500", textClass: "text-amber-600" };
    case "UNAVAILABLE":
      return { label: "Unavailable", dotClass: "bg-red-500", textClass: "text-red-600" };
    default:
      return { label: "Check availability", dotClass: "bg-gray-400", textClass: "text-gray-500" };
  }
}

function getFreshnessBadge(lastUpdated: string) {
  const updatedDate = new Date(lastUpdated);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff < 7) {
    return { label: "Updated recently", className: "badge-fresh border" };
  } else if (daysDiff <= 30) {
    return { label: "Updated 2 weeks ago", className: "badge-moderate border" };
  }
  return { label: "May be outdated", className: "badge-stale border" };
}

function formatRate(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) {
    if (min === max) return `$${min}/day`;
    return `$${min}-${max}/day`;
  }
  if (min !== null) return `From $${min}/day`;
  return `Up to $${max}/day`;
}

export function ListingCard({ result, onRequestAvailability, searchContext }: ListingCardProps) {
  const availability = getAvailabilityDisplay(result.availabilityStatus);
  const freshness = getFreshnessBadge(result.lastUpdated);
  const rateDisplay = formatRate(result.rateDayMin, result.rateDayMax);

  const logAndNavigate = async (eventType: ContactEventType, action: () => void) => {
    // Fire tracking call (non-blocking) then immediately perform action
    trackingApi.logContactEvent({
      vendorId: result.vendorId,
      equipmentId: result.id,
      eventType,
      searchLocationText: searchContext?.locationText,
      searchRadius: searchContext?.radius,
      needDate: searchContext?.needDate,
    });
    action();
  };

  const handleCall = () => {
    logAndNavigate("CALL", () => {
      window.location.href = `tel:${result.vendorPhone}`;
    });
  };

  const handleText = () => {
    logAndNavigate("TEXT", () => {
      window.location.href = `sms:${result.vendorPhone}`;
    });
  };

  const handleEmail = () => {
    logAndNavigate("EMAIL", () => {
      window.location.href = `mailto:${result.vendorEmail}`;
    });
  };

  const handleWebsite = () => {
    if (result.vendorWebsite) {
      logAndNavigate("WEBSITE", () => {
        window.open(result.vendorWebsite!, "_blank");
      });
    }
  };

  return (
    <div
      className={cn(
        "industrial-card p-4 space-y-4",
        result.isSponsored && "ring-2 ring-primary/20 bg-primary/[0.02]"
      )}
    >
      {/* Header row: Vendor name + badges */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{result.vendorName}</h3>
            {result.make || result.model ? (
              <p className="text-sm text-muted-foreground truncate">
                {[result.year, result.make, result.model].filter(Boolean).join(" ")}
              </p>
            ) : null}
          </div>
          <Badge variant="secondary" className="shrink-0">
            {result.type === "CTL" ? "CTL" : "Skid Steer"}
          </Badge>
        </div>

        {/* Status row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Availability indicator */}
          <div className={cn("flex items-center gap-1.5 text-sm font-medium", availability.textClass)}>
            <span className={cn("w-2 h-2 rounded-full", availability.dotClass)} />
            {availability.label}
          </div>

          {/* Freshness badge */}
          <Badge variant="outline" className={cn("text-xs", freshness.className)}>
            <Clock className="w-3 h-3 mr-1" />
            {freshness.label}
          </Badge>

          {/* Distance */}
          {result.distance !== null ? (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              {result.distance.toFixed(1)} mi
            </span>
          ) : null}
        </div>
      </div>

      {/* Rate display */}
      {rateDisplay ? (
        <div className="text-lg font-semibold text-foreground">{rateDisplay}</div>
      ) : null}

      {/* Contact buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="touch-target flex-1 min-w-[80px]"
          onClick={handleCall}
        >
          <Phone className="w-4 h-4" />
          Call
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="touch-target flex-1 min-w-[80px]"
          onClick={handleText}
        >
          <MessageSquare className="w-4 h-4" />
          Text
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="touch-target flex-1 min-w-[80px]"
          onClick={handleEmail}
        >
          <Mail className="w-4 h-4" />
          Email
        </Button>
        {result.vendorWebsite ? (
          <Button
            variant="outline"
            size="sm"
            className="touch-target flex-1 min-w-[80px]"
            onClick={handleWebsite}
          >
            <Globe className="w-4 h-4" />
            Website
          </Button>
        ) : null}
      </div>

      {/* Request Availability button */}
      <Button
        className="w-full touch-target"
        onClick={() => onRequestAvailability(result)}
      >
        Request Availability
      </Button>
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="industrial-card p-4 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
      </div>

      {/* Status skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-5 w-20 bg-muted animate-pulse rounded" />
        <div className="h-5 w-28 bg-muted animate-pulse rounded-full" />
      </div>

      {/* Rate skeleton */}
      <div className="h-6 w-24 bg-muted animate-pulse rounded" />

      {/* Buttons skeleton */}
      <div className="flex gap-2">
        <div className="h-12 flex-1 bg-muted animate-pulse rounded" />
        <div className="h-12 flex-1 bg-muted animate-pulse rounded" />
        <div className="h-12 flex-1 bg-muted animate-pulse rounded" />
      </div>

      <div className="h-12 w-full bg-muted animate-pulse rounded" />
    </div>
  );
}
