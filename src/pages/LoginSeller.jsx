import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Store } from "lucide-react";
import authApi from "../api/authApi";
import useAuthStore from "../store/useAuthStore";

const INPUT_CLS = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition placeholder-gray-400";

export default function LoginSeller() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await authApi.loginSeller(form);
      const { token, refreshToken, user } = res;
      if (user?.role !== "seller") {
        setErrorMsg("Tài khoản này không phải Seller. Vui lòng dùng trang đăng nhập khác.");
        return;
      }
      localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      setUser(user);
      window.dispatchEvent(new Event("auth-change"));
      navigate("/seller");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit(e);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-center items-center bg-orange-500 text-white p-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-3">Chào mừng trở lại!</h2>
          <p className="text-center text-sm text-orange-100 leading-relaxed">
            Đăng nhập để quản lý cửa hàng<br />và đơn hàng của bạn.
          </p>
          <div className="mt-6 flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 text-xs text-orange-100">
            Dành riêng cho Nhà bán hàng
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-8 md:p-10">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Đăng nhập Seller</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Quản lý shop của bạn tại đây</p>

          {errorMsg && (
            <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={INPUT_CLS}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={INPUT_CLS}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Chưa có tài khoản Seller?{" "}
              <Link to="/register-seller" className="text-orange-500 font-medium hover:underline">
                Đăng ký ngay
              </Link>
            </p>

            <p className="text-center text-sm text-gray-500">
              Là khách hàng?{" "}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Đăng nhập tại đây
              </Link>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}
