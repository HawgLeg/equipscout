import { Link, useLocation, useNavigate } from "react-router-dom";
import { authClient, useSession } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Store,
  Flag,
  LogOut,
  ChevronDown,
  DollarSign,
} from "lucide-react";
import { DozerIcon } from "@/components/icons/DozerIcon";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { title: "Overview", icon: LayoutDashboard, href: "/admin" },
  { title: "Vendors", icon: Store, href: "/admin/vendors" },
  { title: "Billing", icon: DollarSign, href: "/admin/billing" },
  { title: "Reports", icon: Flag, href: "/admin/reports" },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate("/admin/login", { replace: true });
  };

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() || "A";

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-slate-200">
        <SidebarHeader className="border-b border-slate-200 p-4">
          <Link to="/admin" className="flex items-center gap-3">
            <DozerIcon className="w-9 h-9 text-primary" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">EquipScout</p>
              <p className="text-xs text-slate-500">Admin Panel</p>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="p-3">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={
                    item.href === "/admin"
                      ? location.pathname === "/admin"
                      : location.pathname.startsWith(item.href)
                  }
                  tooltip={item.title}
                >
                  <Link to={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-200 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-2 h-auto py-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {session?.user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {session?.user?.email}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem disabled className="text-slate-500">
                Signed in as admin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-4 md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-slate-900">
              {navItems.find(
                (item) =>
                  item.href === location.pathname ||
                  (item.href !== "/admin" &&
                    location.pathname.startsWith(item.href))
              )?.title ||
                (location.pathname === "/admin" ? "Overview" : "Admin")}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-slate-50">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
