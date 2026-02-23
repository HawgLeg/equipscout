import { Link } from "react-router-dom";
import { DozerIcon } from "@/components/icons/DozerIcon";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="px-4 py-8 mt-auto border-t border-border animate-fade-in" style={{ animationDelay: "600ms" }}>
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <DozerIcon className="w-8 h-8 text-primary" />
          <span className="text-sm font-semibold text-foreground">EquipScout</span>
        </div>

        {/* Links */}
        <nav className="flex items-center justify-center gap-6 mb-6">
          <Link
            to="/terms"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center"
          >
            Terms
          </Link>
          <Link
            to="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center"
          >
            Privacy
          </Link>
          <Link
            to="/disclaimer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center"
          >
            Disclaimer
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground text-center">
          {currentYear} EquipScout. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
