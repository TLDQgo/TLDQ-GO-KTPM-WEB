import Input from "../components/common/Input";
import { useState } from "react";
import authApi from "../api/authApi";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const Login = () => {
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
      const res = await authApi.login({ email, password });
      toast.success(res.message || "Đăng nhập thành công!");
      localStorage.setItem("token", res.token);
      setUser(res.user);
      window.dispatchEvent(new Event("auth-change"));
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 text-white pt-[200px] justify-center">
        <div className="px-10">
          <h1 className="text-4xl font-bold leading-tight">
            Hệ thống <br />
            Thương mại điện tử <span className="text-yellow-400">Bàn Ghế Công Thái Học</span>
          </h1>
          <p className="mt-4">Sức khoẻ của bạn là niềm vui của chúng tôi</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/2 flex pt-[100px] justify-center bg-gray-50">
        <div className="w-full max-w-md p-6">
          <h2 className="mb-6 text-2xl font-semibold text-center">Đăng nhập</h2>

          {/* Google Login */}
          <button className="flex items-center justify-center w-full gap-2 py-3 mb-4 border rounded-lg hover:bg-gray-100">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              className="w-5 h-5"
            />
            <span className="text-sm">Đăng nhập với Google</span>
          </button>

          <p className="mb-4 text-center text-gray-400">Hoặc</p>

          {/* Form */}
          <div className="space-y-4">
            <Input
              placeholder="Email"
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
                className="absolute cursor-pointer right-3 top-3"
              >
                👁
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleLogin}
                className="w-1/2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 py-3"
              >
                Đăng nhập
              </button>

              <Link to="/register" className="w-1/2 text-center font-semibold text-blue-600 transition border border-blue-600 rounded-lg hover:bg-blue-50 py-3 block">
                Đăng ký
              </Link>
            </div>

            {/* Forgot */}
            <p className="text-sm text-center text-blue-600 cursor-pointer">
              Quên mật khẩu?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
