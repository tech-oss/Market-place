import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  count?: number;
  className?: string;
  size?: number;
}

export function StarRating({ rating, count, className, size = 14 }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Star
        className="fill-amber-400 text-amber-400"
        style={{ width: size, height: size }}
      />
      <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-sm text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
