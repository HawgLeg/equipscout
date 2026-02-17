import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Flag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentId: string;
  vendorId: string;
}

const REPORT_REASONS = [
  { value: "outdated", label: "Availability info is outdated" },
  { value: "wrong_info", label: "Incorrect equipment details" },
  { value: "contact_wrong", label: "Contact information is wrong" },
  { value: "closed", label: "Business appears closed" },
  { value: "other", label: "Other issue" },
];

export function ReportModal({
  open,
  onOpenChange,
  equipmentId,
  vendorId,
}: ReportModalProps) {
  const [reason, setReason] = useState("outdated");
  const [details, setDetails] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post("/api/reports", {
        equipmentId,
        vendorId,
        reason: details ? `${reason}: ${details}` : reason,
      });
    },
    onSuccess: () => {
      onOpenChange(false);
      setReason("outdated");
      setDetails("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-500" />
            Report Listing
          </DialogTitle>
          <DialogDescription>
            Help us keep listings accurate. What seems incorrect?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            {REPORT_REASONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide more details about the issue..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-h-[48px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending}
              className="min-h-[48px]"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {mutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>

        {mutation.isError && (
          <p className="text-sm text-destructive text-center mt-2">
            Failed to submit report. Please try again.
          </p>
        )}

        {mutation.isSuccess && (
          <p className="text-sm text-emerald-600 text-center mt-2">
            Report submitted. Thank you!
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
