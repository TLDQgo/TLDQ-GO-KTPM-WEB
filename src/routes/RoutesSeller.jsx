import { Route, Navigate } from "react-router-dom";
import { SellerLayout } from "./DashBoardLayout";
import HomeSeller from "../pages/seller/HomeSeller";
import ProductManagementSeller from "../pages/seller/ProductManagementSeller";
import ProductNewAddPage from "../pages/seller/ProductNewAddPage";
import OrderManagementSeller from "../pages/seller/OrderManagementSeller";
import SellerSettings from "../pages/seller/SellerSettings";
import VoucherManagementSeller from "../pages/seller/VoucherManagementSeller";
import RevenueStatsSeller from "../pages/seller/RevenueStatsSeller";
import FlashSaleManagement from "../pages/seller/FlashSaleManagement";
import useAuthStore from "../store/useAuthStore";

function SellerPrivateRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  if (!user || user.role !== "seller") {
    return <Navigate to="/login-seller" replace />;
  }
  return children;
}

export default function RoutesSeller() {
  return (
    <>
      <Route
        path="/seller"
        element={
          <SellerPrivateRoute>
            <SellerLayout>
              <HomeSeller />
            </SellerLayout>
          </SellerPrivateRoute>
        }
      />
      <Route
        path="/seller/quan-ly-san-pham"
        element={
          <SellerPrivateRoute>
            <SellerLayout>
              <ProductManagementSeller />
            </SellerLayout>
          </SellerPrivateRoute>
        }
      />
      <Route
        path="/seller/them-san-pham"
        element={
          <SellerPrivateRoute>
            <SellerLayout>
              <ProductNewAddPage />
            </SellerLayout>
          </SellerPrivateRoute>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <SellerPrivateRoute>
            <SellerLayout>
              <OrderManagementSeller />
            </SellerLayout>
          </SellerPrivateRoute>
        }
      />
      <Route
        path="/seller/settings"
        element={
          <SellerPrivateRoute>
            <SellerLayout>
              <SellerSettings />
            </SellerLayout>
          </SellerPrivateRoute>
        }
      />
      <Route
        path="/seller/promotions"
        element={
          <SellerPrivateRoute>
            <SellerLayout>
              <VoucherManagementSeller />
            </SellerLayout>
          </SellerPrivateRoute>
        }
      />
      <Route
        path="/seller/thong-ke"
        element={
          <SellerPrivateRoute>
            <SellerLayout>
              <RevenueStatsSeller />
            </SellerLayout>
          </SellerPrivateRoute>
        }
      />
      <Route
        path="/seller/flash-sale"
        element={
          <SellerPrivateRoute>
            <SellerLayout>
              <FlashSaleManagement />
            </SellerLayout>
          </SellerPrivateRoute>
        }
      />
    </>
  );
}
