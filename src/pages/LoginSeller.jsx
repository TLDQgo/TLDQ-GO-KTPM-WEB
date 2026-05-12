import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authApi from "../api/authApi";
import useAuthStore from "../store/useAuthStore";

export default function LoginSeller() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      toast.error("Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.loginSeller(form);

      setUser(res.user);
      localStorage.setItem("token", res.token);
      window.dispatchEvent(new Event("auth-change"));

      toast.success(res.message || "Đăng nhập seller thành công!");
      navigate("/seller");
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng nhập seller thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-orange-100 px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/5 lg:grid-cols-2">
        <div className="hidden flex-col justify-center bg-gradient-to-br from-blue-700 to-orange-500 p-10 text-white lg:flex">
          <h1 className="text-4xl font-black leading-tight">
            Đăng nhập người bán
          </h1>
          <p className="mt-4 max-w-md text-white/85">
            Khu vực dành riêng cho người bán để quản lý cửa hàng, sản phẩm và đơn hàng.
          </p>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-slate-900">Đăng nhập seller</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                required
              />

              <div className="-mt-2 flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-orange-600 transition hover:text-orange-700 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  to="/register-seller"
                  className="rounded-xl border border-orange-200 px-4 py-3 text-center font-semibold text-orange-600 transition hover:bg-orange-50"
                >
                  Đăng ký seller
                </Link>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Quay lại login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
