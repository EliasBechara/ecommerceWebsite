export const ProductCardSkeleton = () => {
  return (
    <article className="p-3 sm:p-4 rounded-lg">
      <div className="relative">
        <div className="skeleton w-full aspect-square rounded mb-3 sm:mb-4" />
      </div>

      <div className="flex justify-center mt-1">
        <div className="skeleton absolute bottom-3 w-24 h-8 rounded" />
      </div>
    </article>
  );
};
