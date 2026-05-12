import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../components/common/Input";
import authApi from "../api/authApi";
import useAuthStore from "../store/useAuthStore";

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginAsSeller, setLoginAsSeller] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      toast.error("Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);

      const res = loginAsSeller
        ? await authApi.loginSeller({ email, password })
        : await authApi.login({ email, password });

      setUser(res.user);
      localStorage.setItem("token", res.token);
      window.dispatchEvent(new Event("auth-change"));

      toast.success(res.message || "Đăng nhập thành công!");

      if (loginAsSeller) {
        navigate("/seller");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center px-16 text-white bg-blue-700">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-blue-100">
            TLDQ-GO
          </p>
          <h1 className="max-w-lg text-5xl font-black leading-tight">
            Hệ thống thương mại điện tử
            <span className="block mt-2 text-orange-300">Bàn Ghế Công Thái Học</span>
          </h1>
          <p className="max-w-md mt-6 text-blue-100">
            Đăng nhập theo vai trò khách hàng hoặc người bán, tùy theo nhu cầu sử dụng.
          </p>
        </div>

        <div className="flex items-center justify-center px-5 py-12">
          <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl ring-1 ring-black/5">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-slate-900">Đăng Nhập</h2>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setLoginAsSeller(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${!loginAsSeller
                  ? "bg-white text-blue-700 shadow"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                Khách hàng
              </button>
              <button
                type="button"
                onClick={() => setLoginAsSeller(true)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${loginAsSeller
                  ? "bg-orange-500 text-white shadow"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                Người bán
              </button>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="relative">
                <Input
                  placeholder="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-3 text-sm text-slate-500"
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>

              <div className="-mt-2 flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className={`w-full rounded-xl py-3 font-semibold text-white transition ${loginAsSeller
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-blue-600 hover:bg-blue-700"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <div className="flex gap-3">
                <Link
                  to="/register"
                  className="flex-1 rounded-xl border border-blue-200 px-4 py-3 text-center font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  Đăng ký
                </Link>
                <Link
                  to="/register-seller"
                  className="flex-1 rounded-xl border border-orange-200 px-4 py-3 text-center font-semibold text-orange-600 transition hover:bg-orange-50"
                >
                  Bán hàng
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
