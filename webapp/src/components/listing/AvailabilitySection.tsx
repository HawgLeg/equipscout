import { Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Availability } from "../../../../backend/src/types";
import {
  getAvailabilityStyle,
  getFreshnessIndicator,
  formatDate,
} from "@/types/equipment";

interface AvailabilitySectionProps {
  availability: Availability | null;
}

export function AvailabilitySection({ availability }: AvailabilitySectionProps) {
  const status = availability?.status ?? "UNKNOWN";
  const statusStyle = getAvailabilityStyle(status);
  const freshness = availability?.lastUpdated
    ? getFreshnessIndicator(availability.lastUpdated)
    : null;
  const earliestDate = availability?.earliestDate
    ? formatDate(availability.earliestDate)
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status badge */}
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn("text-sm px-3 py-1", statusStyle.className)}
          >
            {statusStyle.label}
          </Badge>
          {freshness && (
            <Badge
              variant="outline"
              className={cn("text-xs", freshness.className)}
            >
              {freshness.label}
            </Badge>
          )}
        </div>

        {/* Earliest available date */}
        {earliestDate && status !== "AVAILABLE" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Earliest available: {earliestDate}</span>
          </div>
        )}

        {/* Last updated info */}
        {availability?.lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated:{" "}
            {new Date(availability.lastUpdated).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
