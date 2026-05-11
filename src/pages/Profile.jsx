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
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? (import.meta.env.VITE_API_URL || "http://localhost:3000")
    : "";

  const getFullImageUrl = (path) => {
    if (!path) return "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${API_BASE_URL}${path}`;
  };

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn (tối đa 5MB)");
      return;
    }

    // Create local preview
    const localUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, avatar_url: localUrl }));

    const formDataUpload = new FormData();
    formDataUpload.append("avatar", file);

    setUploading(true);
    try {
      const res = await authApi.uploadAvatar(formDataUpload);
      // After success, update with the real server path
      const imageUrl = res?.avatar_url || res?.url;
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, avatar_url: imageUrl }));
      }
      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi tải ảnh lên");
      // Fallback to default or previous if upload fails? 
      // For now just keep what was there
    } finally {
      setUploading(false);
    }
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
              src={getFullImageUrl(formData.avatar_url)}
              alt="Avatar"
              className="object-cover w-32 h-32 border-4 border-white rounded-full shadow"
              onError={(e) => {
                // Only reset if it's not a blob preview and it's actually failing
                if (!formData.avatar_url.startsWith("blob:") && formData.avatar_url !== "") {
                  console.log("Avatar load failed, using default");
                  e.target.src = "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg";
                }
              }}
            />
            <p className="text-sm font-medium text-gray-500">
              Ảnh đại diện
            </p>
            <div className="w-full">
              <label className="block w-full py-2 text-sm text-center text-white transition bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-600">
                {uploading ? "Đang tải..." : "Thay ảnh đại diện"}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
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

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 font-bold text-white transition duration-200 bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Lưu Thông Tin"}
                </button>
              </div>

              {isSeller && (
                <div className="pt-4">
                  <Link to="/seller">
                    <button
                      type="button"
                      className="w-full px-4 py-3 font-bold text-white transition duration-200 bg-green-500 hover:bg-green-600 rounded-xl"
                    >
                      Quay lại trang cửa hàng
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
