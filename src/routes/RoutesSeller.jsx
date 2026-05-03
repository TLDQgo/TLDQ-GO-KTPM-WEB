import { Route } from "react-router-dom";
import { SellerLayout } from "./DashBoardLayout";
import HomeSeller from "../pages/seller/HomeSeller";
import ProductManagementSeller from "../pages/seller/ProductManagementSeller";
import ProductNewAddPage from "../pages/seller/ProductNewAddPage";
import OrderManagementSeller from "../pages/seller/OrderManagementSeller";
import SellerSettings from "../pages/seller/SellerSettings";
import VoucherManagementSeller from "../pages/seller/VoucherManagementSeller";
import RevenueStatsSeller from "../pages/seller/RevenueStatsSeller";

export default function RoutesSeller() {
  return (
    <>
      <Route
        path="/seller"
        element={
          <SellerLayout>
            <HomeSeller />
          </SellerLayout>
        }
      />
      <Route
        path="/seller/quan-ly-san-pham"
        element={
          <SellerLayout>
            <ProductManagementSeller />
          </SellerLayout>
        }
      />
      <Route
        path="/seller/them-san-pham"
        element={
          <SellerLayout>
            <ProductNewAddPage />
          </SellerLayout>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <SellerLayout>
            <OrderManagementSeller />
          </SellerLayout>
        }
      />
      <Route
        path="/seller/settings"
        element={
          <SellerLayout>
            <SellerSettings />
          </SellerLayout>
        }
      />
      <Route
        path="/seller/promotions"
        element={
          <SellerLayout>
            <VoucherManagementSeller />
          </SellerLayout>
        }
      />
      <Route
        path="/seller/thong-ke"
        element={
          <SellerLayout>
            <RevenueStatsSeller />
          </SellerLayout>
        }
      />
    </>
  );
}
