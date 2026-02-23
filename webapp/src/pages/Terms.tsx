import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-8 px-4">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using EquipScout ("the Service"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              EquipScout is a discovery platform that helps contractors find available construction equipment
              from rental vendors in the Austin, TX area. <strong>EquipScout does not rent, sell, or own any equipment.</strong>
              We provide information and facilitate connections between equipment seekers and rental vendors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. No Warranty on Listings</h2>
            <p className="text-muted-foreground leading-relaxed">
              Equipment availability, pricing, and other listing information are provided by third-party vendors
              and may change without notice. EquipScout makes no warranties regarding the accuracy, completeness,
              or timeliness of any listing information. Users should verify all details directly with vendors
              before making rental decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vendors who register for accounts are responsible for maintaining the security of their credentials
              and for all activities under their accounts. Vendors agree to provide accurate business information
              and keep their listings current.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Prohibited Conduct</h2>
            <p className="text-muted-foreground leading-relaxed">Users agree not to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Post false or misleading information</li>
              <li>Attempt to interfere with the Service's operation</li>
              <li>Harvest or collect user information without consent</li>
              <li>Use the Service for any unlawful purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Vendor Billing Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Vendors listed on EquipScout are billed on a pay-per-lead (Cost Per Click) basis for qualified contact actions only.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>Billable actions include:</strong> Call clicks, text clicks, email clicks, website visits, and availability request submissions.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>Non-billable activities:</strong> Page views, search impressions, result views, and scrolling are never billed.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Billing occurs weekly or monthly at EquipScout's discretion</li>
              <li>Default rate is $15 per qualified action (may vary by vendor agreement)</li>
              <li>Vendors may opt out at any time by contacting support</li>
              <li>No long-term contracts are required</li>
              <li>Disputed charges may be reviewed upon request</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              EquipScout does not guarantee equipment availability, rental outcomes, or lead quality.
              Vendors are responsible for responding to leads and managing their own customer relationships.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              EquipScout shall not be liable for any direct, indirect, incidental, or consequential damages
              arising from the use of the Service or any transactions conducted through connections made via
              the Service. All equipment rentals are conducted directly between users and vendors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the Service after
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these terms, contact us at legal@equipscout.io
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
