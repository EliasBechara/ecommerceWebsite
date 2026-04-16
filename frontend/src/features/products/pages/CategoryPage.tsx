import { useParams } from "react-router-dom";
import { useGetProductsByCategoryQuery } from "../api/productsApi";
import { ProductList } from "../components/ProductList";
import { PageLayout } from "../../../components/layout/PageLayout";
import { ErrorMessage } from "../components/ErrorMessage";
import { getErrorMessage } from "../../../utils/getErrorMessage";

export const CategoryPage = () => {
  const params = useParams<{ category: string }>();

  const categoryName = params.category?.toUpperCase() || "";

  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useGetProductsByCategoryQuery(categoryName, {
    skip: !categoryName,
  });

  if (isError) {
    return (
      <PageLayout>
        <ErrorMessage message={getErrorMessage(error)} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ProductList
        title={categoryName}
        products={products}
        isLoading={isLoading}
      />
    </PageLayout>
  );
};
