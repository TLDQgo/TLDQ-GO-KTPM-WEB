import { Route } from "react-router-dom";
import { AdminLayout } from "./DashBoardLayout";
import HomeAdmin from "../pages/admin/HomeAdmin";

export default function RoutesAdmin() {
  return (
    <>
      <Route
        path="/admin/home"
        element={
          <AdminLayout>
            <HomeAdmin />
          </AdminLayout>
        }
      />
    </>
  );
}
