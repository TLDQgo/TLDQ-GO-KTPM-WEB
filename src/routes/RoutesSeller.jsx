import { Route } from "react-router-dom";
import { SellerLayout } from "./DashBoardLayout";
import HomeSeller from "../pages/seller/HomeSeller";
import ProductManagementSeller from "../pages/seller/ProductManagementSeller";
import ProductNewAddPage from "../pages/seller/ProductNewAddPage";
import OrderManagementSeller from "../pages/seller/OrderManagementSeller";

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
    </>
  );
}
