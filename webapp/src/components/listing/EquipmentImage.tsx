import { Truck } from "lucide-react";

interface EquipmentImageProps {
  imageUrl: string | null;
  alt: string;
}

export function EquipmentImage({ imageUrl, alt }: EquipmentImageProps) {
  if (imageUrl) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Truck className="w-16 h-16" />
        <span className="text-sm">No image available</span>
      </div>
    </div>
  );
}
