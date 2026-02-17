import { Phone, MessageSquare, Mail, Globe, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { EquipmentDetail } from "@/types/equipment";
import type { ContactEventType } from "../../../../backend/src/types";

interface ContactSectionProps {
  equipment: EquipmentDetail;
  onRequestAvailability: () => void;
}

export function ContactSection({
  equipment,
  onRequestAvailability,
}: ContactSectionProps) {
  const { vendor } = equipment;

  const trackContact = async (eventType: ContactEventType) => {
    try {
      await api.post("/api/contact-events", {
        vendorId: vendor.id,
        equipmentId: equipment.id,
        eventType,
      });
    } catch {
      // Silently fail - don't block user action
    }
  };

  const handleCall = () => {
    trackContact("CALL");
    window.location.href = `tel:${vendor.phone}`;
  };

  const handleText = () => {
    trackContact("TEXT");
    window.location.href = `sms:${vendor.phone}`;
  };

  const handleEmail = () => {
    trackContact("EMAIL");
    window.location.href = `mailto:${vendor.email}`;
  };

  const handleWebsite = () => {
    if (vendor.website) {
      trackContact("WEBSITE");
      window.open(vendor.website, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Contact {vendor.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary action */}
        <Button
          onClick={onRequestAvailability}
          size="lg"
          className="w-full min-h-[56px] text-base font-semibold shadow-lg shadow-primary/25"
        >
          <Send className="w-5 h-5 mr-2" />
          Request Availability
        </Button>

        {/* Contact buttons grid */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleCall}
            className="min-h-[56px] flex-col gap-1"
          >
            <Phone className="w-5 h-5" />
            <span className="text-sm">Call</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleText}
            className="min-h-[56px] flex-col gap-1"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm">Text</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleEmail}
            className="min-h-[56px] flex-col gap-1"
          >
            <Mail className="w-5 h-5" />
            <span className="text-sm">Email</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleWebsite}
            disabled={!vendor.website}
            className="min-h-[56px] flex-col gap-1"
          >
            <Globe className="w-5 h-5" />
            <span className="text-sm">Website</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
