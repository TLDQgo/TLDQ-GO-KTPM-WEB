import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import authApi from "../api/authApi";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
    address_line: "",
    shop_name: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setFormData({
          full_name: parsed.full_name || "",
          phone: parsed.phone || "",
          avatar_url: parsed.avatar_url || "",
          address_line: parsed.customerProfile?.address_line || parsed.sellerProfile?.address_line || "",
          shop_name: parsed.sellerProfile?.shop_name || "",
        });
        setProfile(parsed.customerProfile || parsed.sellerProfile || null);
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    } else {
      toast.error("Vui lòng đăng nhập để xem hồ sơ");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Không tìm thấy thông tin định danh người dùng!");
      return;
    }

    setLoading(true);

    try {
      let res;
      if (user.role === "seller") {
        res = await authApi.updateSellerProfile({
          full_name: formData.full_name,
          phone: formData.phone,
          avatar_url: formData.avatar_url,
          address_line: formData.address_line,
          shop_name: formData.shop_name,
        });
      } else {
        res = await authApi.updateProfile({
          full_name: formData.full_name,
          phone: formData.phone,
          avatar_url: formData.avatar_url,
          address_line: formData.address_line,
        });
      }

      toast.success("Cập nhật thông tin thành công!");

      const updatedUser = { ...user, ...res.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      window.dispatchEvent(new Event("auth-change"));
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi hệ thống khi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return <div className="p-8 text-center">Vui lòng đăng nhập...</div>;

  const isSeller = user.role === "seller";

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="max-w-3xl p-8 mx-auto bg-white shadow rounded-2xl">
        <div className="flex items-center justify-between pb-4 mb-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isSeller ? "Hồ Sơ Người Bán" : "Hồ Sơ Người Dùng"}
          </h2>
          <Link
            to="/change-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Đổi mật khẩu
          </Link>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Avatar side */}
          <div className="flex flex-col items-center w-full gap-4 pr-4 border-r md:w-1/3">
            <img
              src={
                formData.avatar_url ||
                "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg"
              }
              alt="Avatar"
              className="object-cover w-32 h-32 border-4 border-white rounded-full shadow"
              onError={(e) => {
                e.target.src = "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg";
              }}
            />
            <p className="text-sm font-medium text-gray-500">
              Bản thu nhỏ đại diện
            </p>
            <div className="w-full">
              <label className="block mb-1 text-xs text-gray-600">
                Link ảnh đại diện (URL)
              </label>
              <input
                type="text"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Form side */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Email{" "}
                  <span className="text-xs text-red-500">(Không thể đổi)</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-2 text-gray-500 bg-gray-100 border rounded-lg cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address_line"
                  value={formData.address_line}
                  onChange={handleChange}
                  placeholder="97 Võ Văn Ngân, Thủ Đức, TP.HCM"
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isSeller && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Tên cửa hàng
                  </label>
                  <input
                    type="text"
                    name="shop_name"
                    value={formData.shop_name}
                    onChange={handleChange}
                    placeholder="Tên cửa hàng của bạn"
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Quyền hạn (Role)
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    user.role === "seller"
                      ? "Người Bán (Seller)"
                      : user.role === "admin"
                      ? "Quản Trị Viên (Admin)"
                      : "Khách Hàng (Customer)"
                  }
                  className="w-full px-3 py-2 text-gray-500 bg-gray-100 border rounded-lg cursor-not-allowed"
                />
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 font-bold text-white transition duration-200 bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Lưu Thông Tin"}
                </button>
              </div>

              {!isSeller ? (
                <div className="pt-4">
                  <Link to="/register-seller">
                    <button
                      type="button"
                      className="w-full px-4 py-3 font-bold text-white transition duration-200 bg-orange-500 hover:bg-orange-600 rounded-xl"
                    >
                      Đăng Ký Bán Hàng Ngay
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="pt-4">
                  <Link to="/seller">
                    <button
                      type="button"
                      className="w-full px-4 py-3 font-bold text-white transition duration-200 bg-green-500 hover:bg-green-600 rounded-xl"
                    >
                      Quay Lại Trang Quản Lý
                    </button>
                  </Link>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
