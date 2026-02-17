import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, DollarSign, TrendingUp, Calendar, Pause, Play, Ban, MoreVertical, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EventStats {
  total: number;
  call: number;
  text: number;
  email: number;
  website: number;
  request: number;
}

interface VendorBillingData {
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  cpcRate: number;
  billingStatus: string;
  onboardingDate: string;
  lastContactedAt: string | null;
  adminNotes: string | null;
  thisWeek: EventStats;
  thisMonth: EventStats;
  amountDueThisMonth: number;
}

interface BillingResponse {
  vendors: VendorBillingData[];
  totals: {
    totalBillableThisWeek: number;
    totalBillableThisMonth: number;
    totalRevenue: number;
  };
  period: {
    weekStart: string;
    monthStart: string;
  };
}

type DateRange = "7d" | "30d" | "custom";
type BillingStatusFilter = "ALL" | "ACTIVE" | "PAUSED" | "OPTED_OUT";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
}: {
  title: string;
  value: string | number;
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
          <Skeleton className="h-8 w-24" />
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

function getBillingStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>;
    case "PAUSED":
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Paused</Badge>;
    case "OPTED_OUT":
      return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Opted Out</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function AdminBilling() {
  const queryClient = useQueryClient();
  const [editingVendor, setEditingVendor] = useState<VendorBillingData | null>(null);
  const [newCpcRate, setNewCpcRate] = useState("");
  const [editingNotes, setEditingNotes] = useState<VendorBillingData | null>(null);
  const [newNotes, setNewNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillingStatusFilter>("ALL");
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const { data: billing, isLoading } = useQuery({
    queryKey: ["admin", "billing", dateRange],
    queryFn: () => api.get<BillingResponse>(`/api/admin/billing?range=${dateRange}`),
  });

  const updateCpcMutation = useMutation({
    mutationFn: ({ vendorId, cpcRate }: { vendorId: string; cpcRate: number }) =>
      api.put(`/api/admin/billing/${vendorId}`, { cpcRate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "billing"] });
      setEditingVendor(null);
      setNewCpcRate("");
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: ({ vendorId, data }: { vendorId: string; data: Record<string, unknown> }) =>
      api.put(`/api/admin/vendors/${vendorId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "billing"] });
      setEditingNotes(null);
      setNewNotes("");
    },
  });

  const handleStatusChange = (vendorId: string, newStatus: string) => {
    updateVendorMutation.mutate({ vendorId, data: { billingStatus: newStatus } });
  };

  const handleMarkContacted = (vendorId: string) => {
    updateVendorMutation.mutate({ vendorId, data: { lastContactedAt: new Date().toISOString() } });
  };

  const filteredVendors = billing?.vendors.filter((v) => {
    if (statusFilter === "ALL") return true;
    return v.billingStatus === statusFilter;
  }) ?? [];

  const handleExportCSV = () => {
    if (!billing) return;

    const headers = [
      "Vendor Name",
      "Email",
      "Billing Status",
      "CPC Rate ($)",
      "Onboarding Date",
      "Last Contacted",
      "This Week - Total",
      "This Week - Calls",
      "This Week - Texts",
      "This Week - Emails",
      "This Week - Website",
      "This Week - Requests",
      "This Month - Total",
      "This Month - Calls",
      "This Month - Texts",
      "This Month - Emails",
      "This Month - Website",
      "This Month - Requests",
      "Amount Due ($)",
      "Admin Notes",
    ];

    const rows = filteredVendors.map((v) => [
      v.vendorName,
      v.vendorEmail,
      v.billingStatus,
      v.cpcRate,
      v.onboardingDate ? new Date(v.onboardingDate).toLocaleDateString() : "",
      v.lastContactedAt ? new Date(v.lastContactedAt).toLocaleDateString() : "",
      v.thisWeek.total,
      v.thisWeek.call,
      v.thisWeek.text,
      v.thisWeek.email,
      v.thisWeek.website,
      v.thisWeek.request,
      v.thisMonth.total,
      v.thisMonth.call,
      v.thisMonth.text,
      v.thisMonth.email,
      v.thisMonth.website,
      v.thisMonth.request,
      v.amountDueThisMonth.toFixed(2),
      v.adminNotes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `billing-${dateRange}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Calculate filtered totals
  const filteredTotals = {
    totalBillable: filteredVendors.reduce((sum, v) => sum + v.thisMonth.total, 0),
    totalRevenue: filteredVendors.reduce((sum, v) => sum + v.amountDueThisMonth, 0),
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Business Model Note */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Pay-per-lead model:</span> Vendors are billed only for qualified contact actions (calls, texts, emails, website clicks, and availability requests).
              No charge for views or searches. Vendors can opt out at any time.
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-slate-600">Period:</Label>
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm text-slate-600">Status:</Label>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BillingStatusFilter)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Vendors</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="OPTED_OUT">Opted Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="This Week Events"
            value={billing?.totals.totalBillableThisWeek ?? 0}
            icon={TrendingUp}
            description="Billable contact events"
            isLoading={isLoading}
          />
          <StatCard
            title="This Month Events"
            value={billing?.totals.totalBillableThisMonth ?? 0}
            icon={Calendar}
            description="Billable contact events"
            isLoading={isLoading}
          />
          <StatCard
            title="Revenue This Month"
            value={formatCurrency(billing?.totals.totalRevenue ?? 0)}
            icon={DollarSign}
            description="Total amount due"
            isLoading={isLoading}
          />
          <StatCard
            title="Active Vendors"
            value={billing?.vendors.filter(v => v.billingStatus === "ACTIVE").length ?? 0}
            icon={FileText}
            description="Vendors with active billing"
            isLoading={isLoading}
          />
        </div>

        {/* Billing Table */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Vendor Billing</CardTitle>
              <CardDescription>
                {statusFilter === "ALL" ? "All vendors" : `${statusFilter.toLowerCase()} vendors`}
                {" "}— {filteredVendors.length} vendors, {formatCurrency(filteredTotals.totalRevenue)} due
              </CardDescription>
            </div>
            <Button onClick={handleExportCSV} disabled={isLoading || !billing}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">CPC Rate</TableHead>
                      <TableHead className="text-right">Week</TableHead>
                      <TableHead className="text-right">Month</TableHead>
                      <TableHead className="text-right">Amount Due</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
                      <TableRow key={vendor.vendorId} className={vendor.billingStatus !== "ACTIVE" ? "opacity-60" : ""}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{vendor.vendorName}</p>
                            <p className="text-sm text-slate-500">{vendor.vendorEmail}</p>
                            {vendor.adminNotes && (
                              <p className="text-xs text-slate-400 truncate max-w-[200px]" title={vendor.adminNotes}>
                                Note: {vendor.adminNotes}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getBillingStatusBadge(vendor.billingStatus)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(vendor.cpcRate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm">
                            <span className="font-medium">{vendor.thisWeek.total}</span>
                            <span className="text-slate-500 ml-1 text-xs block">
                              {vendor.thisWeek.call}C/{vendor.thisWeek.text}T/{vendor.thisWeek.email}E/{vendor.thisWeek.website}W/{vendor.thisWeek.request}R
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm">
                            <span className="font-medium">{vendor.thisMonth.total}</span>
                            <span className="text-slate-500 ml-1 text-xs block">
                              {vendor.thisMonth.call}C/{vendor.thisMonth.text}T/{vendor.thisMonth.email}E/{vendor.thisMonth.website}W/{vendor.thisMonth.request}R
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-emerald-600">
                          {vendor.billingStatus === "ACTIVE" ? formatCurrency(vendor.amountDueThisMonth) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setEditingVendor(vendor);
                                setNewCpcRate(vendor.cpcRate.toString());
                              }}>
                                Edit CPC Rate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setEditingNotes(vendor);
                                setNewNotes(vendor.adminNotes || "");
                              }}>
                                Edit Notes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMarkContacted(vendor.vendorId)}>
                                Mark Contacted
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {vendor.billingStatus === "ACTIVE" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(vendor.vendorId, "PAUSED")}>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pause Billing
                                </DropdownMenuItem>
                              )}
                              {vendor.billingStatus === "PAUSED" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(vendor.vendorId, "ACTIVE")}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Resume Billing
                                </DropdownMenuItem>
                              )}
                              {vendor.billingStatus !== "OPTED_OUT" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(vendor.vendorId, "OPTED_OUT")}
                                  className="text-red-600"
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Mark Opted Out
                                </DropdownMenuItem>
                              )}
                              {vendor.billingStatus === "OPTED_OUT" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(vendor.vendorId, "ACTIVE")}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Reactivate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredVendors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                          No vendors found with current filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend & Billing Terms */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                C = Call, T = Text, E = Email, W = Website, R = Request
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Billing Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Pay-as-you-go. No contracts required. Vendors may opt out at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit CPC Rate Dialog */}
      <Dialog open={!!editingVendor} onOpenChange={() => setEditingVendor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit CPC Rate</DialogTitle>
            <DialogDescription>
              Update the cost-per-click rate for {editingVendor?.vendorName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cpcRate">CPC Rate ($)</Label>
              <Input
                id="cpcRate"
                type="number"
                step="0.01"
                min="0"
                value={newCpcRate}
                onChange={(e) => setNewCpcRate(e.target.value)}
                placeholder="15.00"
              />
              <p className="text-xs text-slate-500">Default rate is $15 per qualified action</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVendor(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingVendor && newCpcRate) {
                  updateCpcMutation.mutate({
                    vendorId: editingVendor.vendorId,
                    cpcRate: parseFloat(newCpcRate),
                  });
                }
              }}
              disabled={updateCpcMutation.isPending}
            >
              {updateCpcMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Notes Dialog */}
      <Dialog open={!!editingNotes} onOpenChange={() => setEditingNotes(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin Notes</DialogTitle>
            <DialogDescription>
              Add internal notes for {editingNotes?.vendorName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Add notes about this vendor..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNotes(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingNotes) {
                  updateVendorMutation.mutate({
                    vendorId: editingNotes.vendorId,
                    data: { adminNotes: newNotes || null },
                  });
                }
              }}
              disabled={updateVendorMutation.isPending}
            >
              {updateVendorMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
