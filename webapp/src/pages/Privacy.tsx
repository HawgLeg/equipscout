import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-8 px-4">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>For Contractors (Equipment Seekers):</strong> We collect minimal information.
              When you submit an availability request, you may optionally provide your name, phone, and email.
              We also collect usage data such as search queries and contact clicks to improve our service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong>For Vendors:</strong> We collect your business contact information (company name, phone,
              email, website, yard address) and account credentials to provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Information</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>To connect contractors with equipment vendors</li>
              <li>To facilitate availability requests and lead routing</li>
              <li>To provide vendors with analytics about their listings</li>
              <li>To improve and optimize the Service</li>
              <li>To communicate service updates (for registered vendors)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you submit an availability request, your contact information is shared with the relevant
              vendor so they can respond to your inquiry. We do not sell personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including encrypted connections (HTTPS),
              secure password storage, and access controls. However, no system is completely secure,
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies to maintain user sessions and preferences. We may use analytics
              tools to understand how users interact with our service. You can control cookies through
              your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain availability request data for 90 days for analytics purposes. Vendor account
              data is retained while the account is active. Contact event data is retained for
              reporting purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may request access to, correction of, or deletion of your personal information by
              contacting us at privacy@equipscout.io. Vendors may update their information through
              the vendor dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related questions, contact us at privacy@equipscout.io
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
