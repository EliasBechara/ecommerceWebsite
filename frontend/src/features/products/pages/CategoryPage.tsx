import { useParams, useSearchParams } from "react-router-dom";
import { useGetProductsByCategoryQuery } from "../api/productsApi";
import { ProductList } from "../components/products/ProductList";
import { PageLayout } from "../../../components/layout/PageLayout";
import { ErrorMessage } from "../components/ErrorMessage";

import { SortDropdown } from "../components/SortDropdown";
import { getApiErrorMessage } from "../../../api/apiError";

type Props = {
  forcedCategory?: string;
};

export const CategoryPage = ({ forcedCategory }: Props) => {
  const params = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryName = forcedCategory || params.category?.toUpperCase() || "";
  const sort = searchParams.get("sort") || "newest";

  const handleSortChange = (newSort: string) => {
    setSearchParams({ sort: newSort });
  };

  const { data: products, isLoading, isError, error } = useGetProductsByCategoryQuery(
    { category: categoryName, sort },
    { skip: !categoryName }
  );



  if (isError) {
    return (
      <PageLayout>
        <ErrorMessage message={getApiErrorMessage(error)} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SortDropdown onChange={handleSortChange} currentSort={sort} />
      <ProductList
        title={categoryName}
        products={products}
        isLoading={isLoading}
      />
    </PageLayout>
  );
};
