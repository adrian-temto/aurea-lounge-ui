import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-6xl" aria-busy="true" aria-label="Wird geladen">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="mt-3 h-4 w-48" />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-72 rounded-lg lg:col-span-3" />
        <Skeleton className="h-72 rounded-lg lg:col-span-2" />
      </div>
    </div>
  );
}
