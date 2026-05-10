import { Route } from "react-router-dom";
import { AdminLayout } from "./DashBoardLayout";
import HomeAdmin from "../pages/admin/HomeAdmin";
import UserManagement from "../pages/admin/UserManagement";
import SystemStats from "../pages/admin/SystemStats";
import LoginAdmin from "../pages/admin/LoginAdmin";
import ProductManagementAdmin from "../pages/admin/ProductManagementAdmin";

export default function RoutesAdmin() {
  return (
    <>
      {/* Login — no layout */}
      <Route path="/admin/login" element={<LoginAdmin />} />

      {/* Admin dashboard routes */}
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <HomeAdmin />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminLayout>
            <UserManagement />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/quan-ly-san-pham"
        element={
          <AdminLayout>
            <ProductManagementAdmin />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/stats"
        element={
          <AdminLayout>
            <SystemStats />
          </AdminLayout>
        }
      />
    </>
  );
}
