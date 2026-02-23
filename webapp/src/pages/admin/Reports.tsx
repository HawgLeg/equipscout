import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, Loader2, AlertTriangle } from "lucide-react";

interface Report {
  id: string;
  equipmentId: string | null;
  equipmentTitle: string | null;
  vendorId: string | null;
  vendorName: string | null;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reporterEmail: string | null;
}

function ReportTableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-32" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function AdminReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: () => api.get<Report[]>("/api/admin/reports"),
  });

  const updateReportMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) =>
      api.put<Report>(`/api/admin/reports/${data.id}`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
      toast({
        title: "Report updated",
        description: "The report status has been updated.",
      });
      setIsDetailsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMarkReviewed = (report: Report) => {
    updateReportMutation.mutate({ id: report.id, status: "reviewed" });
  };

  const handleDismiss = (report: Report) => {
    updateReportMutation.mutate({ id: report.id, status: "dismissed" });
  };

  const pendingReports = reports?.filter(
    (r) => r.status.toLowerCase() === "pending"
  );

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "pending") {
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          Pending
        </Badge>
      );
    }
    if (statusLower === "reviewed") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Reviewed
        </Badge>
      );
    }
    if (statusLower === "dismissed") {
      return (
        <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
          Dismissed
        </Badge>
      );
    }
    return (
      <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
        {status}
      </Badge>
    );
  };

  const getReasonBadge = (reason: string) => {
    const reasonLower = reason.toLowerCase();
    if (reasonLower.includes("spam") || reasonLower.includes("fake")) {
      return (
        <Badge variant="outline" className="border-red-200 text-red-700">
          {reason}
        </Badge>
      );
    }
    if (reasonLower.includes("inappropriate") || reasonLower.includes("offensive")) {
      return (
        <Badge variant="outline" className="border-orange-200 text-orange-700">
          {reason}
        </Badge>
      );
    }
    if (reasonLower.includes("inaccurate") || reasonLower.includes("misleading")) {
      return (
        <Badge variant="outline" className="border-yellow-200 text-yellow-700">
          {reason}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-slate-200 text-slate-700">
        {reason}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Summary Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium text-sm">
              {pendingReports?.length ?? 0} pending reports
            </span>
          </div>
        </div>

        {/* Reports Table */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-slate-900">All Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">
                      Equipment/Vendor
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Reason
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Date Reported
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Reporter
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <ReportTableSkeleton />
                  ) : reports?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-slate-500"
                      >
                        No reports found
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports?.map((report) => (
                      <TableRow key={report.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-900">
                          <div className="space-y-1">
                            {report.equipmentTitle && (
                              <p className="truncate max-w-[200px]">
                                {report.equipmentTitle}
                              </p>
                            )}
                            {report.vendorName && (
                              <p className="text-xs text-slate-500">
                                by {report.vendorName}
                              </p>
                            )}
                            {!report.equipmentTitle && !report.vendorName && (
                              <p className="text-slate-400">N/A</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getReasonBadge(report.reason)}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="text-slate-600">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-slate-600 truncate max-w-[150px]">
                          {report.reporterEmail || "Anonymous"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {report.status.toLowerCase() === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleMarkReviewed(report)}
                                  disabled={updateReportMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-500 hover:text-slate-600 hover:bg-slate-100"
                                  onClick={() => handleDismiss(report)}
                                  disabled={updateReportMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Review the report and take action
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 py-4">
              {selectedReport.equipmentTitle && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Equipment
                  </p>
                  <p className="font-medium text-slate-900">
                    {selectedReport.equipmentTitle}
                  </p>
                </div>
              )}
              {selectedReport.vendorName && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Vendor
                  </p>
                  <p className="font-medium text-slate-900">
                    {selectedReport.vendorName}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Reason
                </p>
                <div>{getReasonBadge(selectedReport.reason)}</div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Description
                </p>
                <p className="text-slate-700">
                  {selectedReport.description || "No description provided"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Status
                </p>
                <div>{getStatusBadge(selectedReport.status)}</div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Date Reported
                </p>
                <p className="text-slate-700">
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Reporter
                </p>
                <p className="text-slate-700">
                  {selectedReport.reporterEmail || "Anonymous"}
                </p>
              </div>
            </div>
          )}
          {selectedReport?.status.toLowerCase() === "pending" && (
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => handleDismiss(selectedReport)}
                disabled={updateReportMutation.isPending}
              >
                {updateReportMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Dismiss
              </Button>
              <Button
                onClick={() => handleMarkReviewed(selectedReport)}
                disabled={updateReportMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {updateReportMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Mark as Reviewed
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
