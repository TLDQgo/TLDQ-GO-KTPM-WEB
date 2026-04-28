import { Route } from "react-router-dom";
import Home from "../pages/Home";
import { UserLayout } from "./DashBoardLayout";
import Register from "../pages/Register";
import Login from "../pages/Login";

import Profile from "../pages/Profile";
import RegisterSeller from "../pages/RegisterSeller";
import LoginSeller from "../pages/LoginSeller";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import ChangePassword from "../pages/ChangePassword";

export default function RoutesUser() {
  return (
    <>
      <Route
        path="/"
        element={
          <UserLayout>
            <Home />
          </UserLayout>
        }
      />
      <Route
        path="/register"
        element={
          <UserLayout>
            <Register />
          </UserLayout>
        }
      />
      <Route
        path="/login"
        element={
          <UserLayout>
            <Login />
          </UserLayout>
        }
      />
      <Route
        path="/register-seller"
        element={
          <UserLayout>
            <RegisterSeller />
          </UserLayout>
        }
      />
      <Route
        path="/login-seller"
        element={
          <UserLayout>
            <LoginSeller />
          </UserLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <UserLayout>
            <Profile />
          </UserLayout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <UserLayout>
            <ForgotPassword />
          </UserLayout>
        }
      />
      <Route
        path="/reset-password"
        element={
          <UserLayout>
            <ResetPassword />
          </UserLayout>
        }
      />
      <Route
        path="/change-password"
        element={
          <UserLayout>
            <ChangePassword />
          </UserLayout>
        }
      />
    </>
  );
}
