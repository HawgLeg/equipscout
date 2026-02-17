import { DollarSign, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRateRange } from "@/types/equipment";
import type { Equipment } from "../../../../backend/src/types";

interface RatesSectionProps {
  equipment: Pick<
    Equipment,
    "rateHourMin" | "rateHourMax" | "rateDayMin" | "rateDayMax"
  >;
}

export function RatesSection({ equipment }: RatesSectionProps) {
  const hourlyRate = formatRateRange(
    equipment.rateHourMin,
    equipment.rateHourMax
  );
  const dailyRate = formatRateRange(equipment.rateDayMin, equipment.rateDayMax);

  // Don't render if no rates available
  if (!hourlyRate && !dailyRate) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Rental Rates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {hourlyRate && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="w-4 h-4" />
                Hourly
              </div>
              <p className="text-xl font-bold text-foreground">{hourlyRate}</p>
            </div>
          )}

          {dailyRate && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="w-4 h-4" />
                Daily
              </div>
              <p className="text-xl font-bold text-foreground">{dailyRate}</p>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Rates may vary. Contact vendor for exact pricing.
        </p>
      </CardContent>
    </Card>
  );
}
