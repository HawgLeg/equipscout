import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Equipment,
  EquipmentType,
  SizeClass,
  AvailabilityStatus,
} from "../../../../backend/src/types";

const equipmentFormSchema = z.object({
  type: z.enum([
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
  ]),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().min(1900).max(2100).optional().or(z.literal("")),
  sizeClass: z.enum(["small", "medium", "large"]).optional(),
  rateHourMin: z.coerce.number().min(0).optional().or(z.literal("")),
  rateHourMax: z.coerce.number().min(0).optional().or(z.literal("")),
  rateDayMin: z.coerce.number().min(0).optional().or(z.literal("")),
  rateDayMax: z.coerce.number().min(0).optional().or(z.literal("")),
  notes: z.string().optional(),
  availabilityStatus: z.enum(["AVAILABLE", "LIMITED", "UNAVAILABLE", "UNKNOWN"]),
  earliestDate: z.string().optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

interface EquipmentWithAvailability extends Equipment {
  availability?: {
    status: AvailabilityStatus;
    earliestDate: string | null;
  };
}

interface EquipmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: EquipmentWithAvailability | null;
  onSubmit: (data: EquipmentFormValues) => Promise<void>;
  isLoading: boolean;
}

const equipmentTypeOptions: { value: EquipmentType; label: string }[] = [
  { value: "CTL", label: "Compact Track Loader (CTL)" },
  { value: "SKID", label: "Skid Steer" },
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

const sizeClassOptions: { value: SizeClass; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const availabilityStatusOptions: { value: AvailabilityStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "LIMITED", label: "Limited Availability" },
  { value: "UNAVAILABLE", label: "Unavailable" },
  { value: "UNKNOWN", label: "Unknown" },
];

export function EquipmentForm({
  open,
  onOpenChange,
  equipment,
  onSubmit,
  isLoading,
}: EquipmentFormProps) {
  const isEditing = !!equipment;

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      type: equipment?.type ?? "CTL",
      make: equipment?.make ?? "",
      model: equipment?.model ?? "",
      year: equipment?.year ?? "",
      sizeClass: equipment?.sizeClass ?? undefined,
      rateHourMin: equipment?.rateHourMin ?? "",
      rateHourMax: equipment?.rateHourMax ?? "",
      rateDayMin: equipment?.rateDayMin ?? "",
      rateDayMax: equipment?.rateDayMax ?? "",
      notes: equipment?.notes ?? "",
      availabilityStatus: equipment?.availability?.status ?? "AVAILABLE",
      earliestDate: equipment?.availability?.earliestDate ?? "",
    },
  });

  // Reset form when equipment changes or modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      form.reset({
        type: equipment?.type ?? "CTL",
        make: equipment?.make ?? "",
        model: equipment?.model ?? "",
        year: equipment?.year ?? "",
        sizeClass: equipment?.sizeClass ?? undefined,
        rateHourMin: equipment?.rateHourMin ?? "",
        rateHourMax: equipment?.rateHourMax ?? "",
        rateDayMin: equipment?.rateDayMin ?? "",
        rateDayMax: equipment?.rateDayMax ?? "",
        notes: equipment?.notes ?? "",
        availabilityStatus: equipment?.availability?.status ?? "AVAILABLE",
        earliestDate: equipment?.availability?.earliestDate ?? "",
      });
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (data: EquipmentFormValues) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Equipment" : "Add Equipment"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your equipment listing"
              : "Add a new piece of equipment to your listings"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Equipment Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {equipmentTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Make & Model row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="Caterpillar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="259D3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Year & Size Class row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2023"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sizeClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size Class</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sizeClassOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Hourly Rate Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rateHourMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate Min ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="75"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rateHourMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate Max ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="125"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Daily Rate Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rateDayMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Rate Min ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="350"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rateDayMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Rate Max ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="500"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional details about this equipment..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Availability Status */}
            <FormField
              control={form.control}
              name="availabilityStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availabilityStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Earliest Available Date */}
            <FormField
              control={form.control}
              name="earliestDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Earliest Available Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Add Equipment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
