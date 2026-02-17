import { Clock, DollarSign, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Clock,
    title: "Real-time Availability",
    description: "See which equipment is actually available right now, not last week.",
  },
  {
    icon: DollarSign,
    title: "Compare Rates",
    description: "View daily and hourly rates from multiple vendors at a glance.",
  },
  {
    icon: Phone,
    title: "Contact Directly",
    description: "Call, text, or email vendors directly from search results.",
  },
];

export function FeatureCards() {
  return (
    <section className="px-4 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg md:text-xl font-semibold text-center text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
          Why contractors choose EquipScout
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-fade-in"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
