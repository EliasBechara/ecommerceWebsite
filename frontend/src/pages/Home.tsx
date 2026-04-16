import { useGetProductsByCategoryQuery } from "../features/products/api/productsApi";
import { ProductList } from "../features/products/components/ProductList";
import { PageLayout } from "../components/layout/PageLayout";

// TODO: Define Home page strategy (featured products, categories, or landing content)
// Temporarily using "CPUS" category as placeholder

export const Home = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsByCategoryQuery("CPUS");

  if (isLoading)
    return <div className="min-h-screen bg-greyOne">Loading...</div>;

  if (isError) return <div>Something Went Wrong</div>;

  return (
    <PageLayout>
      <ProductList title="CPUS" products={products} />
    </PageLayout>
  );
};
