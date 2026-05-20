import { Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import PaymentResult from "../pages/PaymentResult";
import Checkout from "../pages/Checkout";
import OrderHistory from "../pages/OrderHistory";
import SearchResults from "../pages/SearchResults";
import { UserLayout } from "./DashBoardLayout";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Profile from "../pages/Profile";
import RegisterSeller from "../pages/RegisterSeller";
import LoginSeller from "../pages/LoginSeller";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import ChangePassword from "../pages/ChangePassword";
import useAuthStore from "../store/useAuthStore";

function UserPrivateRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function RoutesUser() {
  return (
    <>
      {/* Public routes — không cần đăng nhập */}
      <Route path="/" element={<UserLayout><Home /></UserLayout>} />
      <Route path="/san-pham/:id" element={<UserLayout><ProductDetail /></UserLayout>} />
      <Route path="/gio-hang" element={<UserLayout><Cart /></UserLayout>} />
      <Route path="/tim-kiem" element={<UserLayout><SearchResults /></UserLayout>} />
      <Route path="/register" element={<UserLayout><Register /></UserLayout>} />
      <Route path="/login" element={<UserLayout><Login /></UserLayout>} />
      <Route path="/register-seller" element={<UserLayout><RegisterSeller /></UserLayout>} />
      <Route path="/login-seller" element={<UserLayout><LoginSeller /></UserLayout>} />
      <Route path="/forgot-password" element={<UserLayout><ForgotPassword /></UserLayout>} />
      <Route path="/reset-password" element={<UserLayout><ResetPassword /></UserLayout>} />
      <Route path="/thanh-toan/ket-qua" element={<PaymentResult />} />

      {/* Private routes — yêu cầu đăng nhập */}
      <Route
        path="/profile"
        element={
          <UserPrivateRoute>
            <UserLayout><Profile /></UserLayout>
          </UserPrivateRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <UserPrivateRoute>
            <UserLayout><Checkout /></UserLayout>
          </UserPrivateRoute>
        }
      />
      <Route
        path="/don-hang"
        element={
          <UserPrivateRoute>
            <UserLayout><OrderHistory /></UserLayout>
          </UserPrivateRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <UserPrivateRoute>
            <UserLayout><ChangePassword /></UserLayout>
          </UserPrivateRoute>
        }
      />
    </>
  );
}
