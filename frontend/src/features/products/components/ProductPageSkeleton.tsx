import { PageLayout } from "../../../components/layout/PageLayout";

export const ProductPageSkeleton = () => {
  return (
    <PageLayout>
      <div className="grid grid-cols-2 gap-1 animate-pulse">
        {/* Image */}
        <div className="skeleton w-100 h-100 aspect-square object-cover rounded mb-3 sm:mb-4 bg-gray-200" />

        {/* Right side */}
        <div className="flex flex-col justify-center gap-y-6">
          {/* Price */}
          <div className="skeleton h-4.75 w-15 bg-gray-200 rounded" />

          {/* Button */}
          <div className="skeleton h-15 w-137.5 bg-gray-200 rounded" />

          <div className="mt-10 space-y-2">
            <div className=" skeleton h-3 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
