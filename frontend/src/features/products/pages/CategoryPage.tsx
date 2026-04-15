import { useParams } from "react-router-dom";
import { useGetProductsByCategoryQuery } from "../api/productsApi";
import { ProductList } from "../components/ProductList";
import { PageLayout } from "../../../components/PageLayout";

export const CategoryPage = () => {
  const params = useParams<{ category: string }>();

  const categoryName = params.category?.toUpperCase() || "";

  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsByCategoryQuery(categoryName);

  if (isLoading) return <div>Loading...</div>;

  if (isError) return <div>Something Went Wrong</div>;

  return (
    <PageLayout>
      <ProductList title={categoryName} products={products} />
    </PageLayout>
  );
};
