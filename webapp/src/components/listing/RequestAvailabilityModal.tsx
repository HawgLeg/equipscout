import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, User, Phone, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import type { EquipmentDetail } from "@/types/equipment";

interface RequestAvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: EquipmentDetail;
}

interface LeadFormData {
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
  message: string;
}

export function RequestAvailabilityModal({
  open,
  onOpenChange,
  equipment,
}: RequestAvailabilityModalProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    requesterName: "",
    requesterPhone: "",
    requesterEmail: "",
    message: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      return api.post("/api/leads", {
        vendorId: equipment.vendorId,
        equipmentId: equipment.id,
        requesterName: data.requesterName || undefined,
        requesterPhone: data.requesterPhone || undefined,
        requesterEmail: data.requesterEmail || undefined,
        message: data.message || undefined,
      });
    },
    onSuccess: () => {
      onOpenChange(false);
      setFormData({
        requesterName: "",
        requesterPhone: "",
        requesterEmail: "",
        message: "",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Request Availability
          </DialogTitle>
          <DialogDescription>
            Send a message to {equipment.vendor.name} about this equipment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requesterName" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Your Name
            </Label>
            <Input
              id="requesterName"
              name="requesterName"
              value={formData.requesterName}
              onChange={handleChange}
              placeholder="John Doe"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requesterPhone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Phone Number
            </Label>
            <Input
              id="requesterPhone"
              name="requesterPhone"
              type="tel"
              value={formData.requesterPhone}
              onChange={handleChange}
              placeholder="(512) 555-1234"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requesterEmail" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="requesterEmail"
              name="requesterEmail"
              type="email"
              value={formData.requesterEmail}
              onChange={handleChange}
              placeholder="john@example.com"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Message (optional)
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="I'm interested in renting this equipment for a project..."
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
              disabled={mutation.isPending}
              className="min-h-[48px]"
            >
              {mutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </form>

        {mutation.isError && (
          <p className="text-sm text-destructive text-center mt-2">
            Failed to send request. Please try again.
          </p>
        )}

        {mutation.isSuccess && (
          <p className="text-sm text-emerald-600 text-center mt-2">
            Request sent successfully!
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
