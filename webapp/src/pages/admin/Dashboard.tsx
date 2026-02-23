import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Store,
  CheckCircle,
  Package,
  Users,
  MousePointerClick,
  Flag,
} from "lucide-react";

interface AdminAnalytics {
  totalVendors: number;
  activeVendors: number;
  totalEquipment: number;
  totalLeads: number;
  totalContactEvents: number;
  pendingReports: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-slate-400" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-3xl font-bold text-slate-900">{value}</div>
        )}
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => api.get<AdminAnalytics>("/api/admin/analytics"),
  });

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Vendors"
            value={analytics?.totalVendors ?? 0}
            icon={Store}
            description="All registered vendors"
            isLoading={isLoading}
          />
          <StatCard
            title="Active Vendors"
            value={analytics?.activeVendors ?? 0}
            icon={CheckCircle}
            description="Vendors with active subscriptions"
            isLoading={isLoading}
          />
          <StatCard
            title="Total Equipment"
            value={analytics?.totalEquipment ?? 0}
            icon={Package}
            description="All listed equipment"
            isLoading={isLoading}
          />
          <StatCard
            title="Total Leads"
            value={analytics?.totalLeads ?? 0}
            icon={Users}
            description="Quote requests received"
            isLoading={isLoading}
          />
          <StatCard
            title="Contact Events"
            value={analytics?.totalContactEvents ?? 0}
            icon={MousePointerClick}
            description="Phone/email clicks"
            isLoading={isLoading}
          />
          <StatCard
            title="Pending Reports"
            value={analytics?.pendingReports ?? 0}
            icon={Flag}
            description="Reports awaiting review"
            isLoading={isLoading}
          />
        </div>

        {/* Quick Info */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                Use the sidebar navigation to manage vendors and review reports.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li>
                  <strong>Vendors:</strong> View, edit, and manage vendor
                  accounts and sponsored status
                </li>
                <li>
                  <strong>Reports:</strong> Review and action user-submitted
                  reports
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
