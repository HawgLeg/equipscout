import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Phone, Mail, MousePointerClick, Plus, RefreshCw, DollarSign, Info } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Vendor, VendorAnalytics } from "../../../../backend/src/types";

const baseUrl = import.meta.env.VITE_BACKEND_URL || "";

async function fetchVendorData(): Promise<Vendor> {
  const response = await fetch(`${baseUrl}/api/vendors/me`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch vendor data");
  const json = await response.json();
  return json.data;
}

async function fetchVendorAnalytics(): Promise<VendorAnalytics> {
  const response = await fetch(`${baseUrl}/api/vendors/me/analytics`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch analytics");
  const json = await response.json();
  return json.data;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: typeof Phone;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function VendorDashboard() {
  const { data: session } = useSession();

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ["vendor", "me"],
    queryFn: fetchVendorData,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["vendor", "analytics"],
    queryFn: fetchVendorAnalytics,
  });

  const isLoading = vendorLoading || analyticsLoading;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {vendorLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            `Welcome back, ${vendor?.name || session?.user?.name || "Vendor"}`
          )}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's how your listings are performing
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Contact Clicks"
          value={analytics?.last30Days.contactClicks ?? 0}
          description="Last 30 days"
          icon={MousePointerClick}
          isLoading={isLoading}
        />
        <StatCard
          title="Lead Requests"
          value={analytics?.last30Days.leadRequests ?? 0}
          description="Last 30 days"
          icon={Mail}
          isLoading={isLoading}
        />
        <StatCard
          title="Call Clicks"
          value={analytics?.callClicks ?? 0}
          description="All time"
          icon={Phone}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Contacts"
          value={analytics?.totalContactClicks ?? 0}
          description="All time"
          icon={MousePointerClick}
          isLoading={isLoading}
        />
      </div>

      {/* Billing Summary */}
      {analytics?.billing && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-lg text-emerald-900">Billing Summary</CardTitle>
            </div>
            <CardDescription>Your current billing period activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">CPC Rate</p>
                <p className="text-xl font-semibold text-emerald-700">
                  ${analytics.billing.cpcRate.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-xl font-semibold">
                  {analytics.billing.thisWeekBillable} <span className="text-sm font-normal text-muted-foreground">clicks</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl font-semibold">
                  {analytics.billing.thisMonthBillable} <span className="text-sm font-normal text-muted-foreground">clicks</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Charges</p>
                <p className="text-xl font-semibold text-emerald-700">
                  ${analytics.billing.estimatedChargeThisMonth.toFixed(2)}
                </p>
              </div>
            </div>
            {/* Transparency Message */}
            <div className="flex items-start gap-2 pt-2 border-t border-emerald-200">
              <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700">
                Billing is based only on qualified contact actions (calls, texts, emails, website visits, and availability requests).
                No charge for page views, searches, or impressions. You may opt out at any time.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your equipment listings and availability
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/vendor/equipment">
              <Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/vendor/equipment">
              <RefreshCw className="w-4 h-4 mr-2" />
              Update Availability
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Breakdown</CardTitle>
            <CardDescription>How renters are reaching you</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Calls</span>
                  <span className="font-medium">{analytics?.callClicks ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Texts</span>
                  <span className="font-medium">{analytics?.textClicks ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Emails</span>
                  <span className="font-medium">{analytics?.emailClicks ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Website Visits</span>
                  <span className="font-medium">{analytics?.websiteClicks ?? 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tips to Get More Leads</CardTitle>
            <CardDescription>Improve your visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                Keep your availability status updated daily
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                Add competitive day rates to your listings
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                Include make, model, and year for better matches
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                Respond quickly to lead requests
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
