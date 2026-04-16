import { useParams } from "react-router-dom";
import { useGetProductBySlugQuery } from "../api/productsApi";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Button } from "../../../components/button/Button";
import { formatUSD } from "../../../utils/formatCurrency";
import { ProductPageSkeleton } from "../components/ProductPageSkeleton";
import { ErrorMessage } from "../components/ErrorMessage";

export const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const {
    data: product,
    isLoading,
    error,
  } = useGetProductBySlugQuery(slug!, { skip: !slug });

  if (isLoading) return <ProductPageSkeleton />;
  if (error || !product)
    return (
      <PageLayout>
        <ErrorMessage />
      </PageLayout>
    );

  return (
    <PageLayout>
      <div className="grid grid-cols-2 gap-1">
        <img
          src={product.image}
          alt={product.name}
          className="w-100 h-100 aspect-square object-cover rounded mb-3 sm:mb-4 bg-gray-200"
        />

        <div className="flex flex-col justify-center gap-y-6">
          <p className="text-[12px] sm:text-[14px] leading-snug tracking-[1px] text-[#2c2c2b] mt-0.5">
            {formatUSD(product.price)}
          </p>
          <Button variant={"addToCartBig"}>ADD TO CART</Button>
          <p className="mt-10 ">{product.description}</p>
        </div>
      </div>
    </PageLayout>
  );
};
