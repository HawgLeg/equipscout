import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Truck,
  Flag,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { EquipmentImage } from "@/components/listing/EquipmentImage";
import { ContactSection } from "@/components/listing/ContactSection";
import { AvailabilitySection } from "@/components/listing/AvailabilitySection";
import { RatesSection } from "@/components/listing/RatesSection";
import { VendorSection } from "@/components/listing/VendorSection";
import { RequestAvailabilityModal } from "@/components/listing/RequestAvailabilityModal";
import { ReportModal } from "@/components/listing/ReportModal";
import {
  EquipmentDetail,
  getEquipmentTypeLabel,
  getSizeClassLabel,
} from "@/types/equipment";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const {
    data: equipment,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["equipment", id],
    queryFn: () => api.get<EquipmentDetail>(`/api/equipment/${id}`),
    enabled: !!id,
  });

  const handleBack = () => {
    // Check if we have a referrer from results page
    if (document.referrer && document.referrer.includes("/results")) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !equipment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6 -ml-2 min-h-[48px]"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <Card className="border-destructive/50">
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    Listing Not Found
                  </h2>
                  <p className="text-muted-foreground max-w-sm">
                    {error instanceof Error
                      ? error.message
                      : "This listing may have been removed or is no longer available."}
                  </p>
                </div>
                <Link to="/">
                  <Button className="mt-4 min-h-[48px]">
                    <Search className="w-4 h-4 mr-2" />
                    Search Equipment
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Build equipment title
  const equipmentTitle = [
    equipment.year,
    equipment.make,
    equipment.model,
  ]
    .filter(Boolean)
    .join(" ");

  const displayTitle =
    equipmentTitle || getEquipmentTypeLabel(equipment.type);

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle grain texture overlay */}
      <div className="fixed inset-0 grain pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 -ml-2 min-h-[48px]"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        {/* Equipment Image */}
        <EquipmentImage
          imageUrl={equipment.imageUrl}
          alt={displayTitle}
        />

        {/* Equipment Details */}
        <div className="mt-6 space-y-4">
          {/* Title and type badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-sm">
                <Truck className="w-3.5 h-3.5 mr-1" />
                {getEquipmentTypeLabel(equipment.type)}
              </Badge>
              {equipment.sizeClass && (
                <Badge variant="outline" className="text-sm">
                  {getSizeClassLabel(equipment.sizeClass)}
                </Badge>
              )}
              {equipment.vendor.isSponsored && (
                <Badge className="sponsored-label">Sponsored</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {displayTitle}
            </h1>
          </div>

          {/* Equipment specs */}
          {(equipment.make || equipment.model || equipment.year) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Equipment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {equipment.make && (
                    <>
                      <dt className="text-muted-foreground">Make</dt>
                      <dd className="font-medium">{equipment.make}</dd>
                    </>
                  )}
                  {equipment.model && (
                    <>
                      <dt className="text-muted-foreground">Model</dt>
                      <dd className="font-medium">{equipment.model}</dd>
                    </>
                  )}
                  {equipment.year && (
                    <>
                      <dt className="text-muted-foreground">Year</dt>
                      <dd className="font-medium">{equipment.year}</dd>
                    </>
                  )}
                  {equipment.sizeClass && (
                    <>
                      <dt className="text-muted-foreground">Size Class</dt>
                      <dd className="font-medium">
                        {getSizeClassLabel(equipment.sizeClass)}
                      </dd>
                    </>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Vendor Section */}
          <VendorSection vendor={equipment.vendor} />

          {/* Availability Section */}
          <AvailabilitySection availability={equipment.availability} />

          {/* Rates Section */}
          <RatesSection equipment={equipment} />

          {/* Notes Section */}
          {equipment.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {equipment.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contact Section */}
          <ContactSection
            equipment={equipment}
            onRequestAvailability={() => setShowRequestModal(true)}
          />

          {/* Report link */}
          <div className="text-center pt-4">
            <Button
              variant="link"
              onClick={() => setShowReportModal(true)}
              className="text-muted-foreground text-sm hover:text-foreground"
            >
              <Flag className="w-4 h-4 mr-1" />
              Report outdated information
            </Button>
          </div>
        </div>

        {/* Request Availability Modal */}
        <RequestAvailabilityModal
          open={showRequestModal}
          onOpenChange={setShowRequestModal}
          equipment={equipment}
        />

        {/* Report Modal */}
        <ReportModal
          open={showReportModal}
          onOpenChange={setShowReportModal}
          equipmentId={equipment.id}
          vendorId={equipment.vendorId}
        />
      </div>
    </div>
  );
}
