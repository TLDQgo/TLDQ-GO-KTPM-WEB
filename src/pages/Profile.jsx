import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    role: "customer",
    avatar_url: "",
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
          role: parsed.role || "customer",
          avatar_url: parsed.avatar_url || "",
        });
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
      const id = user._id || user.id;
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            email: user.email, // keep email immutable
          }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Cập nhật thông tin thành công!");

        // Update localStorage
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        // Emit global event so Header updates immediately
        window.dispatchEvent(new Event("auth-change"));
      } else {
        toast.error(`Lỗi: ${data.message || "Cập nhật thất bại"}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống khi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return <div className="p-8 text-center">Vui lòng đăng nhập...</div>;

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="max-w-3xl p-8 mx-auto bg-white shadow rounded-2xl">
        <h2 className="pb-4 mb-6 text-2xl font-bold text-gray-800 border-b">
          Hồ Sơ Người Dùng
        </h2>

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
            />
            <p className="text-sm font-medium text-gray-500">
              Bản thu nhỏ đại diện
            </p>
            <div className="w-full">
              <label className="block mb-1 text-xs text-gray-600">
                Đổi link ảnh (URL)
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
                  Quyền hạn (Role)
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border rounded-lg outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                >
                  <option value="customer">Khách Hàng (Customer)</option>
                  <option value="seller">Nhà Bán (Seller)</option>
                  <option value="admin">Quản Trị Viên (Admin)</option>
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  * Lưu ý: Bạn có thể tự do đổi quyền để kiểm thử các tính năng
                  hệ thống.
                </p>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 font-bold text-white transition duration-200 bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  {loading ? "Đang xử lý..." : "Lưu Thông Tin Cài Đặt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
