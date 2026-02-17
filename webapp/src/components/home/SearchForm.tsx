import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EquipmentType, NeedDate } from "../../../../backend/src/types";

type EquipmentTypeOption = EquipmentType | "ANY";

const equipmentTypeOptions: { value: EquipmentTypeOption; label: string }[] = [
  { value: "ANY", label: "Any Equipment" },
  { value: "SKID", label: "Skid Steer" },
  { value: "CTL", label: "Compact Track Loader" },
  { value: "EXCAVATOR", label: "Excavator" },
  { value: "DOZER", label: "Dozer / Bulldozer" },
  { value: "CRANE", label: "Crane" },
  { value: "BACKHOE", label: "Backhoe" },
  { value: "FORKLIFT", label: "Forklift" },
  { value: "TELEHANDLER", label: "Telehandler" },
  { value: "LOADER", label: "Wheel Loader" },
  { value: "DUMP_TRUCK", label: "Dump Truck" },
  { value: "ROLLER", label: "Roller / Compactor" },
  { value: "GRADER", label: "Motor Grader" },
  { value: "OTHER", label: "Other" },
];

export function SearchForm() {
  const navigate = useNavigate();
  const [equipmentType, setEquipmentType] = useState<EquipmentTypeOption>("ANY");
  const [location, setLocation] = useState<string>("");
  const [radius, setRadius] = useState<number>(40);
  const [needDate, setNeedDate] = useState<NeedDate | "any">("any");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (equipmentType !== "ANY") {
      params.set("type", equipmentType);
    }
    if (location.trim()) {
      params.set("location", location.trim());
    }
    params.set("radius", radius.toString());
    params.set("needDate", needDate);

    navigate(`/results?${params.toString()}`);
  };

  const radiusOptions = [10, 25, 40];
  const needDateOptions: { value: NeedDate | "any"; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "tomorrow", label: "Tomorrow" },
    { value: "this_week", label: "This Week" },
    { value: "any", label: "Any Time" },
  ];

  return (
    <div className="px-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
      <Card className="max-w-lg mx-auto shadow-lg border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Equipment Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Equipment Type</Label>
              <Select
                value={equipmentType}
                onValueChange={(value) => setEquipmentType(value as EquipmentTypeOption)}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Jobsite Location */}
            <div className="space-y-3">
              <Label htmlFor="location" className="text-sm font-medium text-foreground">
                Jobsite Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter jobsite address..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            {/* Radius */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Search Radius</Label>
              <div className="flex gap-2">
                {radiusOptions.map((r) => (
                  <Button
                    key={r}
                    type="button"
                    variant={radius === r ? "default" : "outline"}
                    onClick={() => setRadius(r)}
                    className="flex-1 min-h-[48px] text-base"
                  >
                    {r} mi
                  </Button>
                ))}
              </div>
            </div>

            {/* Need Date */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">When do you need it?</Label>
              <div className="grid grid-cols-2 gap-2">
                {needDateOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={needDate === option.value ? "default" : "outline"}
                    onClick={() => setNeedDate(option.value)}
                    className="min-h-[48px] text-base"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full min-h-[56px] text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Equipment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
