import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, trackingApi } from "@/lib/api";
import type { SearchResult, LeadRequestCreate } from "../../../../backend/src/types";

interface RequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: SearchResult | null;
  searchContext?: {
    locationText?: string;
    radius?: number;
    needDate?: string;
  };
}

export function RequestModal({ open, onOpenChange, result, searchContext }: RequestModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submitMutation = useMutation({
    mutationFn: async (data: LeadRequestCreate) => {
      // Log REQUEST event for billing
      if (result) {
        trackingApi.logContactEvent({
          vendorId: result.vendorId,
          equipmentId: result.id,
          eventType: "REQUEST",
          searchLocationText: searchContext?.locationText,
          searchRadius: searchContext?.radius,
          needDate: searchContext?.needDate,
        });
      }
      return api.post<{ id: string }>("/api/leads", data);
    },
    onSuccess: () => {
      // Reset form and close modal
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;

    submitMutation.mutate({
      vendorId: result.vendorId,
      equipmentId: result.id,
      requesterName: name || undefined,
      requesterPhone: phone || undefined,
      requesterEmail: email || undefined,
      message: message || undefined,
    });
  };

  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Availability</DialogTitle>
          <DialogDescription>
            Send a request to {result.vendorName} about their {result.type === "CTL" ? "CTL" : "Skid Steer"} equipment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Tell them about your project needs..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full sm:w-auto"
            >
              {submitMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
