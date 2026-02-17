import { Link } from "react-router-dom";
import { ArrowRight, Store } from "lucide-react";

export function VendorCTA() {
  return (
    <section className="px-4 py-8 md:py-12 animate-fade-in" style={{ animationDelay: "500ms" }}>
      <div className="max-w-lg mx-auto">
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 md:p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent mb-4">
            <Store className="w-6 h-6 text-accent-foreground" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
            Are you a rental vendor?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get your equipment in front of contractors actively searching for rentals in Austin.
          </p>
          <Link
            to="/vendors/join"
            className="inline-flex items-center justify-center gap-2 text-primary font-medium hover:underline underline-offset-4 min-h-[48px]"
          >
            List Your Equipment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
