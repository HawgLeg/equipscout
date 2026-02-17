import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EquipmentForm } from "@/components/vendor/EquipmentForm";
import { useToast } from "@/hooks/use-toast";
import type { Equipment, AvailabilityStatus } from "../../../../backend/src/types";

const baseUrl = import.meta.env.VITE_BACKEND_URL || "";

interface EquipmentWithAvailability extends Equipment {
  availability?: {
    status: AvailabilityStatus;
    earliestDate: string | null;
  };
}

async function fetchVendorEquipment(): Promise<EquipmentWithAvailability[]> {
  const response = await fetch(`${baseUrl}/api/vendors/me/equipment`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch equipment");
  const json = await response.json();
  return json.data;
}

function getStatusBadgeVariant(status: AvailabilityStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "AVAILABLE":
      return "default";
    case "LIMITED":
      return "secondary";
    case "UNAVAILABLE":
      return "destructive";
    default:
      return "outline";
  }
}

function getStatusLabel(status: AvailabilityStatus): string {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "LIMITED":
      return "Limited";
    case "UNAVAILABLE":
      return "Unavailable";
    default:
      return "Unknown";
  }
}

function formatRate(min: number | null, max: number | null): string {
  if (min === null && max === null) return "-";
  if (min === null) return `$${max}`;
  if (max === null) return `$${min}`;
  if (min === max) return `$${min}`;
  return `$${min} - $${max}`;
}

function EquipmentCard({
  equipment,
  onEdit,
  onDelete,
}: {
  equipment: EquipmentWithAvailability;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = equipment.availability?.status ?? "UNKNOWN";

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">
              {equipment.type}
              {equipment.make || equipment.model ? " - " : ""}
              {equipment.make} {equipment.model}
            </CardTitle>
            <CardDescription className="mt-1">
              {equipment.year ? `${equipment.year} ` : ""}
              {equipment.sizeClass ? `${equipment.sizeClass.charAt(0).toUpperCase() + equipment.sizeClass.slice(1)} size` : ""}
            </CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(status)}>
            {getStatusLabel(status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Hourly Rate</span>
            <span className="font-medium">
              {formatRate(equipment.rateHourMin, equipment.rateHourMax)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Daily Rate</span>
            <span className="font-medium">
              {formatRate(equipment.rateDayMin, equipment.rateDayMax)}
            </span>
          </div>
          {equipment.notes && (
            <p className="text-sm text-muted-foreground pt-2 border-t">
              {equipment.notes}
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EquipmentCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function VendorEquipment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentWithAvailability | null>(null);
  const [deleteEquipment, setDeleteEquipment] = useState<EquipmentWithAvailability | null>(null);

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["vendor", "equipment"],
    queryFn: fetchVendorEquipment,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch(`${baseUrl}/api/vendors/me/equipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to create equipment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "equipment"] });
      setFormOpen(false);
      toast({ title: "Equipment added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await fetch(`${baseUrl}/api/vendors/me/equipment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to update equipment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "equipment"] });
      setFormOpen(false);
      setEditingEquipment(null);
      toast({ title: "Equipment updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${baseUrl}/api/vendors/me/equipment/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to delete equipment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "equipment"] });
      setDeleteEquipment(null);
      toast({ title: "Equipment deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAdd = () => {
    setEditingEquipment(null);
    setFormOpen(true);
  };

  const handleEdit = (item: EquipmentWithAvailability) => {
    setEditingEquipment(item);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    // Clean up empty strings to null
    const cleanData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );

    if (editingEquipment) {
      await updateMutation.mutateAsync({ id: editingEquipment.id, data: cleanData });
    } else {
      await createMutation.mutateAsync(cleanData);
    }
  };

  const handleDelete = () => {
    if (deleteEquipment) {
      deleteMutation.mutate(deleteEquipment.id);
    }
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Equipment</h1>
          <p className="text-muted-foreground mt-1">
            Manage your equipment listings and availability
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Equipment Grid */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <EquipmentCardSkeleton />
          <EquipmentCardSkeleton />
          <EquipmentCardSkeleton />
        </div>
      ) : equipment && equipment.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {equipment.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => setDeleteEquipment(item)}
            />
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center text-center">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No equipment yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Add your first piece of equipment to start getting leads
            </p>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Equipment Form Modal */}
      <EquipmentForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingEquipment(null);
        }}
        equipment={editingEquipment}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEquipment} onOpenChange={(open) => !open && setDeleteEquipment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this equipment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
