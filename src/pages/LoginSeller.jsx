import Input from "../components/common/Input";
import { useState } from "react";
import authApi from "../api/authApi";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const LoginSeller = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu.");
      return;
    }
    try {
      const res = await authApi.loginSeller({ email, password });

      // Kiểm tra quyền hạn (Role check)
      if (res.user?.role !== "seller") {
        toast.error("Bạn không có quyền đăng nhập vào Kênh Người Bán. Vui lòng đăng ký Seller trước!");
        return;
      }

      toast.success(res.message || "Đăng nhập Seller thành công!");
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      setUser(res.user);
      
      window.dispatchEvent(new Event("auth-change"));

      // Redirect to seller dashboard
      navigate("/seller");
    } catch (error) {
      const errorMsg = error.response?.data?.message;
      if (errorMsg === "Email hoặc mật khẩu không chính xác") {
        toast.error("Bạn không phải là Seller hoặc không có quyền truy cập vào kênh này.");
      } else {
        toast.error(errorMsg || "Đăng nhập thất bại. Vui lòng kiểm tra lại!");
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT */}
      <div className="hidden lg:flex w-1/2 bg-orange-500 text-white pt-[200px] justify-center">
        <div className="px-10">
          <h1 className="text-4xl font-bold leading-tight">
            Kênh Người Bán <br />
            <span className="text-yellow-400">Quản lý Cửa hàng</span> của bạn
          </h1>
          <p className="mt-4">Tiếp cận hàng triệu khách hàng cùng TLDQ-GO</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/2 flex pt-[100px] justify-center bg-gray-50">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-white text-xl font-bold">S</span>
            </div>
            <h2 className="text-2xl font-semibold">Đăng nhập Người bán</h2>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <Input
              placeholder="Email người bán"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password with toggle */}
            <div className="relative">
              <Input
                placeholder="Mật khẩu"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute cursor-pointer right-3 top-3 text-xl"
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>

            {/* Buttons */}
            <div className="pt-2">
              <button
                onClick={handleLogin}
                className="w-full font-semibold text-white transition bg-orange-500 hover:bg-orange-600 rounded-lg py-3 shadow-md"
              >
                Đăng nhập
              </button>
            </div>

            <p className="text-center text-sm text-gray-600 pt-2">
              Chưa có tài khoản bán hàng?
              <Link to="/register-seller">
                <span className="text-orange-500 ml-1 font-medium hover:underline">
                  Đăng ký ngay
                </span>
              </Link>
            </p>

            {/* Forgot */}
            <p className="text-sm text-center pt-2">
              <Link to="/forgot-password" text-orange-500 hover:underline>
                Quên mật khẩu?
              </Link>
            </p>

            <div className="pt-6 text-center">
               <Link to="/" className="text-xs text-gray-400 hover:text-orange-500 transition">
                  Quay lại trang chủ mua sắm
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSeller;
