import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Search, Edit2, Star, Loader2 } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  planStatus: string;
  isSponsored: boolean;
  equipmentCount: number;
  createdAt: string;
}

function VendorTableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function AdminVendors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["admin", "vendors"],
    queryFn: () => api.get<Vendor[]>("/api/admin/vendors"),
  });

  const updateVendorMutation = useMutation({
    mutationFn: (data: { id: string; isSponsored: boolean }) =>
      api.put<Vendor>(`/api/admin/vendors/${data.id}`, {
        isSponsored: data.isSponsored,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
      toast({
        title: "Vendor updated",
        description: "The vendor has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update vendor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleSponsored = async (vendor: Vendor) => {
    updateVendorMutation.mutate({
      id: vendor.id,
      isSponsored: !vendor.isSponsored,
    });
  };

  const filteredVendors = vendors?.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "active" || statusLower === "premium") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          {status}
        </Badge>
      );
    }
    if (statusLower === "trial") {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          {status}
        </Badge>
      );
    }
    if (statusLower === "expired" || statusLower === "cancelled") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          {status}
        </Badge>
      );
    }
    return (
      <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
        {status}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-slate-500">
            {filteredVendors?.length ?? 0} vendor
            {filteredVendors?.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Vendors Table */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-slate-900">All Vendors</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Email
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Phone
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Plan Status
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Sponsored
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Equipment
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <VendorTableSkeleton />
                  ) : filteredVendors?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-slate-500"
                      >
                        No vendors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVendors?.map((vendor) => (
                      <TableRow key={vendor.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            {vendor.name}
                            {vendor.isSponsored && (
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {vendor.email}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {vendor.phone || "-"}
                        </TableCell>
                        <TableCell>
                          {getPlanStatusBadge(vendor.planStatus)}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={vendor.isSponsored}
                            onCheckedChange={() => handleToggleSponsored(vendor)}
                            disabled={updateVendorMutation.isPending}
                          />
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {vendor.equipmentCount}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            View
                          </Button>
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

      {/* View/Edit Vendor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>
              View and manage vendor information
            </DialogDescription>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-500">Name</Label>
                <p className="font-medium text-slate-900">
                  {selectedVendor.name}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-500">Email</Label>
                <p className="font-medium text-slate-900">
                  {selectedVendor.email}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-500">Phone</Label>
                <p className="font-medium text-slate-900">
                  {selectedVendor.phone || "Not provided"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-500">Plan Status</Label>
                <div>{getPlanStatusBadge(selectedVendor.planStatus)}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-500">Equipment Listed</Label>
                <p className="font-medium text-slate-900">
                  {selectedVendor.equipmentCount} items
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-500">Member Since</Label>
                <p className="font-medium text-slate-900">
                  {new Date(selectedVendor.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <Label className="text-slate-900">Sponsored Listing</Label>
                  <p className="text-xs text-slate-500">
                    Featured in search results
                  </p>
                </div>
                <Switch
                  checked={selectedVendor.isSponsored}
                  onCheckedChange={() => {
                    handleToggleSponsored(selectedVendor);
                    setSelectedVendor({
                      ...selectedVendor,
                      isSponsored: !selectedVendor.isSponsored,
                    });
                  }}
                  disabled={updateVendorMutation.isPending}
                />
              </div>
              {updateVendorMutation.isPending && (
                <div className="flex items-center justify-center text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
