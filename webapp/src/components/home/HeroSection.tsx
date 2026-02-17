import { DozerIcon } from "@/components/icons/DozerIcon";

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-8 px-4 md:pt-20 md:pb-12 animate-fade-in">
      {/* Logo / Brand */}
      <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
        <DozerIcon className="w-10 h-10 text-primary" />
        <span className="text-xl font-bold text-foreground">EquipScout</span>
      </div>

      {/* Headline */}
      <h1 className="text-2xl md:text-4xl lg:text-5xl text-center font-bold text-foreground leading-tight max-w-3xl mx-auto">
        Find Available Equipment in Austin{" "}
        <span className="text-primary">— Fast</span>
      </h1>

      {/* Subheadline */}
      <p className="mt-4 md:mt-6 text-base md:text-lg text-muted-foreground text-center max-w-xl mx-auto">
        Compare rates, check availability, and contact vendors directly
      </p>
    </section>
  );
}
