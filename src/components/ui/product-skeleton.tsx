import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-dvh bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back button skeleton */}
          <Skeleton className="h-6 w-32 mb-8" />
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image skeleton */}
            <Skeleton className="aspect-square rounded-3xl" />
            
            {/* Details skeleton */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              
              {/* Price */}
              <div className="flex items-baseline gap-3 py-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              
              {/* Customization box */}
              <Skeleton className="h-64 w-full rounded-2xl" />
              
              {/* Quantity */}
              <div className="flex items-center gap-4 py-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
              
              {/* Buttons */}
              <div className="flex gap-4">
                <Skeleton className="h-14 flex-1 rounded-xl" />
                <Skeleton className="h-14 w-14 rounded-xl" />
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PageSkeleton = () => {
  return (
    <div className="min-h-dvh bg-background animate-pulse">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-4 w-32 mx-auto mb-4" />
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
