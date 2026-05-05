import { CategoryPage } from "../features/products/pages/CategoryPage";
import { CATEGORIES } from "../routes";

export const Home = () => {
  return <CategoryPage forcedCategory={CATEGORIES.CPU} />;
};