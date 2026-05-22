import { useParams, useSearchParams } from "react-router-dom";
import { useGetProductsByCategoryQuery } from "../api/productsApi";
import { ProductList } from "../components/ProductList";
import { PageLayout } from "../../../components/layout/PageLayout";
import { ErrorMessage } from "../components/ErrorMessage";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { SortDropdown } from "../components/SortDropdown";

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
        <ErrorMessage message={getErrorMessage(error)} />
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
