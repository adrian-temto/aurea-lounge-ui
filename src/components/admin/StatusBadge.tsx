import { CircleCheck, CircleDot, CircleSlash, CircleX } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/lib/types";

import { STATUS_LABEL } from "./format";

// Icon + text, so the status never depends on color alone.
const STYLE: Record<ReservationStatus, { cls: string; Icon: typeof CircleDot }> = {
  new: { cls: "bg-amber-100 text-amber-900 ring-amber-300", Icon: CircleDot },
  confirmed: { cls: "bg-green-100 text-green-900 ring-green-300", Icon: CircleCheck },
  declined: { cls: "bg-destructive/8 text-destructive ring-destructive/25", Icon: CircleX },
  cancelled: { cls: "bg-muted text-muted-foreground ring-border", Icon: CircleSlash },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ReservationStatus;
  className?: string;
}) {
  const { cls, Icon } = STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 ring-inset",
        cls,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}
