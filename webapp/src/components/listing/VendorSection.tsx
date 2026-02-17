import { Building2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Vendor } from "../../../../backend/src/types";

interface VendorSectionProps {
  vendor: Vendor;
}

export function VendorSection({ vendor }: VendorSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Vendor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{vendor.name}</span>
          {vendor.isSponsored && (
            <Badge className="sponsored-label text-xs">Sponsored</Badge>
          )}
        </div>

        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{vendor.yardAddress}</span>
        </div>
      </CardContent>
    </Card>
  );
}
