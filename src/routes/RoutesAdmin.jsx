import { Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./DashBoardLayout";
import HomeAdmin from "../pages/admin/HomeAdmin";
import UserManagement from "../pages/admin/UserManagement";
import SystemStats from "../pages/admin/SystemStats";
import LoginAdmin from "../pages/admin/LoginAdmin";
import ProductManagementAdmin from "../pages/admin/ProductManagementAdmin";
import useAuthStore from "../store/useAuthStore";

function AdminPrivateRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function RoutesAdmin() {
  return (
    <>
      <Route path="/admin/login" element={<LoginAdmin />} />

      <Route
        path="/admin"
        element={
          <AdminPrivateRoute>
            <AdminLayout>
              <HomeAdmin />
            </AdminLayout>
          </AdminPrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminPrivateRoute>
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          </AdminPrivateRoute>
        }
      />
      <Route
        path="/admin/quan-ly-san-pham"
        element={
          <AdminPrivateRoute>
            <AdminLayout>
              <ProductManagementAdmin />
            </AdminLayout>
          </AdminPrivateRoute>
        }
      />
      <Route
        path="/admin/stats"
        element={
          <AdminPrivateRoute>
            <AdminLayout>
              <SystemStats />
            </AdminLayout>
          </AdminPrivateRoute>
        }
      />
    </>
  );
}
