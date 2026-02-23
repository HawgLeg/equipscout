import { useState } from "react";
import { DollarSign, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export type RatePeriod = "hour" | "day" | "week";

export interface RateFilterValue {
  maxRate: number;
  period: RatePeriod;
}

interface RateFilterProps {
  value: RateFilterValue;
  onChange: (value: RateFilterValue) => void;
}

const periodLabels: Record<RatePeriod, string> = {
  hour: "per hour",
  day: "per day",
  week: "per week",
};

const periodShortLabels: Record<RatePeriod, string> = {
  hour: "/hr",
  day: "/day",
  week: "/wk",
};

export function RateFilter({ value, onChange }: RateFilterProps) {
  const [open, setOpen] = useState(false);
  const [localRate, setLocalRate] = useState(value.maxRate);
  const [localPeriod, setLocalPeriod] = useState<RatePeriod>(value.period);

  const handleSliderChange = (values: number[]) => {
    setLocalRate(values[0]);
  };

  const handlePeriodChange = (period: RatePeriod) => {
    setLocalPeriod(period);
  };

  const handleApply = () => {
    onChange({ maxRate: localRate, period: localPeriod });
    setOpen(false);
  };

  const handleReset = () => {
    setLocalRate(0);
    setLocalPeriod("day");
    onChange({ maxRate: 0, period: "day" });
    setOpen(false);
  };

  // Sync local state when popover opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setLocalRate(value.maxRate);
      setLocalPeriod(value.period);
    }
    setOpen(isOpen);
  };

  const isFilterActive = value.maxRate > 0;

  const formatButtonLabel = () => {
    if (!isFilterActive) {
      return "Max Rate";
    }
    return `Under $${value.maxRate}${periodShortLabels[value.period]}`;
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={isFilterActive ? "default" : "outline"}
          size="sm"
          className="shrink-0"
        >
          <DollarSign className="h-4 w-4 mr-1" />
          {formatButtonLabel()}
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Maximum Rate</h4>
            {isFilterActive ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-1 px-2 text-xs text-muted-foreground"
                onClick={handleReset}
              >
                Reset
              </Button>
            ) : null}
          </div>

          {/* Period Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {(["hour", "day", "week"] as RatePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={cn(
                  "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  localPeriod === period
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {periodLabels[period]}
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="space-y-3">
            <Slider
              value={[localRate]}
              onValueChange={handleSliderChange}
              min={0}
              max={1000}
              step={50}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">$0</span>
              <span className="font-medium text-lg">
                {localRate === 0 ? (
                  "Any"
                ) : (
                  <>
                    ${localRate}
                    <span className="text-muted-foreground text-sm">
                      {periodShortLabels[localPeriod]}
                    </span>
                  </>
                )}
              </span>
              <span className="text-muted-foreground">$1000</span>
            </div>
          </div>

          {/* Apply Button */}
          <Button onClick={handleApply} className="w-full" size="sm">
            Apply Filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
