import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DozerIcon } from "@/components/icons/DozerIcon";

const navItems = [
  { to: "/vendor", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/vendor/equipment", icon: Package, label: "Equipment", end: false },
  { to: "/vendor/profile", icon: User, label: "Profile", end: false },
];

function NavItem({
  to,
  icon: Icon,
  label,
  end,
  onClick,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  end: boolean;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      }
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/vendor/login");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-4 border-b border-border">
        <DozerIcon className="w-8 h-8 text-primary" />
        <div>
          <span className="text-lg font-bold text-foreground">EquipScout</span>
          <p className="text-xs text-muted-foreground">Vendor Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} onClick={onNavigate} />
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function VendorLayout() {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 border-r border-border bg-card">
          <SidebarContent />
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        {isMobile && (
          <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 border-b border-border bg-background">
            <div className="flex items-center gap-2">
              <DozerIcon className="w-8 h-8 text-primary" />
              <span className="font-bold text-foreground">EquipScout</span>
            </div>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
