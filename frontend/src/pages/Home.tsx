import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { ProductList } from "../features/products/components/ProductList";

export const Home = () => {
  return (
    <>
      <div className="bg-greyOne min-h-screen w-full flex flex-col items-center text-black">
        <Navbar />
        <ProductList />
        <Footer />
      </div>
    </>
  );
};
