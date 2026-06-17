import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router/AppRoutes";

import { useGetMeQuery } from "./features/auth/api/authApi";
import { useHydrateCart } from "./features/cart/hooks/useHydrateCart";

function App() {
  useGetMeQuery();
  useHydrateCart();

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;