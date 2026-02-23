import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-8 px-4">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Disclaimer</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <AlertTriangle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Important Notice</h3>
                <p className="text-muted-foreground leading-relaxed">
                  EquipScout is a discovery platform only. <strong>We do not rent, sell, lease, or own any
                  construction equipment.</strong> All equipment availability, pricing, and rental terms
                  are provided by independent third-party vendors and may change at any time without notice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Platform Role</h2>
            <p className="text-muted-foreground leading-relaxed">
              EquipScout serves solely as an information aggregator and lead routing service. We help
              contractors discover available equipment and connect them with rental vendors. We are not
              a party to any rental agreement, transaction, or contractual relationship between users
              and vendors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Listing Accuracy</h2>
            <p className="text-muted-foreground leading-relaxed">
              While we strive to display accurate information, all listing details including availability
              status, pricing, equipment specifications, and vendor information are provided by vendors
              themselves. We cannot guarantee the accuracy, completeness, or timeliness of this information.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong>Always verify equipment availability and pricing directly with the vendor before
              making any decisions or commitments.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">No Endorsement</h2>
            <p className="text-muted-foreground leading-relaxed">
              The listing of any vendor or equipment on EquipScout does not constitute an endorsement,
              recommendation, or guarantee of quality. Users should conduct their own due diligence
              when selecting vendors and equipment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Sponsored Listings</h2>
            <p className="text-muted-foreground leading-relaxed">
              Some listings may be marked as "Sponsored." These are paid placements that receive
              preferential positioning in search results. Sponsored status does not indicate any
              endorsement or verification of quality by EquipScout.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              EquipScout shall not be held liable for any damages, losses, or disputes arising from:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Inaccurate or outdated listing information</li>
              <li>Equipment quality, condition, or performance</li>
              <li>Vendor conduct, reliability, or service quality</li>
              <li>Any transactions or agreements between users and vendors</li>
              <li>Service interruptions or technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Your Responsibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using EquipScout, you acknowledge that you are responsible for verifying all information
              before entering into any rental agreements. You agree to hold EquipScout harmless from any
              claims arising from your use of information found on this platform.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
