import { Route } from "react-router-dom";
import { AdminLayout } from "./DashBoardLayout";
import HomeAdmin from "../pages/admin/HomeAdmin";
import ProductManagementAdmin from "../pages/admin/ProductManagementAdmin";
import AccountManagementAdmin from "../pages/admin/AccountManagementAdmin";

export default function RoutesAdmin() {
  return (
    <>
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <HomeAdmin />
          </AdminLayout>
        }
      />{" "}
      <Route
        path="/admin/quan-ly-san-pham"
        element={
          <AdminLayout>
            <ProductManagementAdmin />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/quan-ly-tai-khoan"
        element={
          <AdminLayout>
            <AccountManagementAdmin />
          </AdminLayout>
        }
      />
    </>
  );
}
