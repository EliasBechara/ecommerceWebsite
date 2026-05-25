import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { Home } from "./pages/Home";
import { CategoryPage } from "./features/products/pages/CategoryPage";
import { ProductPage } from "./features/products/pages/ProductPage";
import { useHydrateCart } from "./features/cart/hooks/useHydrateCart";

import { CheckoutPage } from "./features/checkout/pages/CheckoutPage";
import { PaymentPage } from "./features/payment/pages/PaymentPage";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { AccountSettingsPage } from "./features/account/pages/AccountSettingsPage";
import { OrderDetailsPage } from "./features/order/pages/OrderDetails";

function App() {
  useHydrateCart();

  return (
    <div className="min-h-screen">
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products/category/:category" element={<CategoryPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout/:sessionId" element={<CheckoutPage />} />
            <Route path="/payment/:orderId" element={<PaymentPage />} />
            <Route path="/account" element={<AccountSettingsPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;