// pages
import { Home } from "./pages/Home";

import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";

import { CategoryPage } from "./features/products/pages/CategoryPage";
import { ProductPage } from "./features/products/pages/ProductPage";

import { CheckoutPage } from "./features/checkout/pages/CheckoutPage";
import { PaymentPage } from "./features/payment/pages/PaymentPage";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { AccountSettingsPage } from "./features/account/pages/AccountSettingsPage";
import { OrderDetailsPage } from "./features/order/pages/OrderDetails";
import { PaymentSuccessPage } from "./features/order/pages/OrderSucess";

// hooks
import { useGetMeQuery } from "./features/auth/api/authApi";
import { useHydrateCart } from "./features/cart/hooks/useHydrateCart";

// router
import { BrowserRouter, Routes, Route } from "react-router-dom";


function App() {
  useGetMeQuery();
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
            <Route
              path="/orders/success/:orderId"
              element={<PaymentSuccessPage />}
            />

          </Route>

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;