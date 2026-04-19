import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterSeller() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shopName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }

    console.log(form);
    alert("Đăng ký thành công!");

    navigate("/login-seller");
  };

  return (
    <div className="min-h-screen flex p-4 justify-center bg-gradient-to-br from-blue-100 to-orange-100 px-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col justify-center items-center bg-orange-500 text-white p-8">
          <h2 className="text-3xl font-bold mb-4">Bắt đầu bán hàng 🚀</h2>
          <p className="text-center text-sm opacity-90">
            Tạo cửa hàng của bạn và tiếp cận hàng ngàn khách hàng ngay hôm nay.
          </p>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="p-8">
          <h1 className="text-2xl font-semibold mb-6 text-center">
            Đăng ký Seller
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="shopName"
              placeholder="Tên cửa hàng"
              value={form.shopName}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            <input
              type="text"
              name="address"
              placeholder="Địa chỉ"
              value={form.address}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-semibold"
            >
              Đăng ký bán hàng
            </button>

            {/* LOGIN LINK */}
            <p className="text-center text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link
                to="/login-seller"
                className="text-orange-500 font-medium hover:underline"
              >
                Đăng nhập Seller
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
