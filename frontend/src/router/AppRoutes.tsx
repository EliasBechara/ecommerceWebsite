import { Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { CategoryPage } from "../features/products/pages/CategoryPage";
import { ProductPage } from "../features/products/pages/ProductPage";
import { CheckoutPage } from "../features/checkout/pages/CheckoutPage";
import { PaymentPage } from "../features/payment/pages/PaymentPage";
import { ProtectedRoute } from "../components/routes/ProtectedRoute";
import { AccountSettingsPage } from "../features/account/pages/AccountSettingsPage";
import { OrderDetailsPage } from "../features/order/pages/OrderDetails";
import { PaymentSuccessPage } from "../features/payment/pages/PaymentSuccess";
import { PrivacyPolicy } from "../pages/PrivacyPolicy";
import { ReturnsAndRefunds } from "../pages/ReturnsAndRefunds";
import { TermsAndConditions } from "../pages/TermsAndConditions";
import { ContactUs } from "../pages/ContactUs";

export function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
                path="/products/category/:category"
                element={<CategoryPage />}
            />
            <Route path="/products/:slug" element={<ProductPage />} />

            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/returns-and-refunds" element={<ReturnsAndRefunds />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/contact" element={<ContactUs />} />

            {/* Protected Routes */}

            <Route element={<ProtectedRoute />}>
                <Route
                    path="/checkout/:sessionId"
                    element={<CheckoutPage />}
                />
                <Route
                    path="/payment/:orderId"
                    element={<PaymentPage />}
                />
                <Route
                    path="/account"
                    element={<AccountSettingsPage />}
                />
                <Route
                    path="/orders/:orderId"
                    element={<OrderDetailsPage />}
                />
                <Route
                    path="/orders/success/:orderId"
                    element={<PaymentSuccessPage />}
                />
            </Route>
        </Routes>
    );
}