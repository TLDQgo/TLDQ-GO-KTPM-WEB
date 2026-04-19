import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await authApi.loginSeller(form);
      const { token, user } = res;

      // Kiểm tra role phải là 'seller'
      if (user?.role !== "seller") {
        setErrorMsg("Tài khoản này không phải Seller. Vui lòng dùng trang đăng nhập khác.");
        return;
      }

      // Lưu token riêng, user qua store (store tự sync localStorage)
      localStorage.setItem("token", token);
      setUser(user);

      window.dispatchEvent(new Event("auth-change"));
      navigate("/seller");
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại Email và Mật khẩu.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex p-4 justify-center bg-gradient-to-br from-blue-100 to-orange-100 px-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-center items-center bg-blue-600 text-white p-8">
          <h2 className="text-3xl font-bold mb-4">Chào mừng trở lại 👋</h2>
          <p className="text-center text-sm opacity-90">
            Đăng nhập để quản lý cửa hàng và đơn hàng của bạn.
          </p>
        </div>

        {/* RIGHT FORM */}
        <div className="p-8">
          <h1 className="text-2xl font-semibold mb-6 text-center">
            Đăng nhập Seller
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ERROR */}
            {errorMsg && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            {/* PASSWORD */}
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {/* LINK REGISTER */}
            <p className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/register-seller"
                className="text-orange-500 font-medium hover:underline"
              >
                Đăng ký Seller
              </Link>
            </p>

            {/* BACK */}
            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full border py-3 rounded-lg hover:bg-gray-100"
            >
              Quay lại
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
