import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Store, Lock, Bell, User, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import authApi from "../../api/authApi";
import useAuthStore from "../../store/useAuthStore";

export default function SellerSettings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const isFromRegister = searchParams.get("from") === "register";
  const [activeTab, setActiveTab] = useState(isFromRegister ? "shop" : "shop");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Shop profile state
  const [shopForm, setShopForm] = useState({
    shop_name: "",
    description: "",
    address_line: "",
    shop_email: "",
    shop_phone: "",
    logo_url: "",
    banner_url: "",
    operating_hours: "",
    shipping_policy: "",
    return_policy: "",
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification state (client-side only)
  const [notifications, setNotifications] = useState({
    newOrder: true,
    customerMessage: true,
    reviewEmail: false,
    weeklyReport: false,
  });

  // Load existing shop data
  useEffect(() => {
    const fetchShopData = async () => {
      if (!user || user.role !== "seller") {
        setInitialLoading(false);
        return;
      }

      try {
        const res = await authApi.getShopSetupStatus();
        if (res?.profile) {
          const p = res.profile;
          setShopForm({
            shop_name: p.shop_name || "",
            description: p.description || "",
            address_line: p.address_line || "",
            shop_email: p.shop_email || "",
            shop_phone: p.shop_phone || "",
            logo_url: p.logo_url || "",
            banner_url: p.banner_url || "",
            operating_hours: p.operating_hours || "",
            shipping_policy: p.shipping_policy || "",
            return_policy: p.return_policy || "",
          });
        }
      } catch (error) {
        console.error("Lỗi load dữ liệu shop:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchShopData();
  }, [user]);

  const handleShopChange = (e) => {
    const { name, value } = e.target;
    setShopForm({ ...shopForm, [name]: value });
  };

  const handleShopSubmit = async (e) => {
    e.preventDefault();

    if (!shopForm.shop_name.trim()) {
      toast.error("Tên cửa hàng là bắt buộc");
      return;
    }

    if (!shopForm.address_line.trim()) {
      toast.error("Địa chỉ cửa hàng là bắt buộc");
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.updateShopSettings(shopForm);

      // Update local user with new shop data
      if (res?.profile) {
        const updatedUser = {
          ...user,
          sellerProfile: res.profile,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      toast.success("Cập nhật thông tin cửa hàng thành công!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật thông tin cửa hàng");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (!passwordForm.newPassword) {
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    setLoading(true);

    try {
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success("Đổi mật khẩu thành công!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login-seller");
  };

  const tabs = [
    { id: "shop", label: "Thông Tin Cửa Hàng", icon: Store },
    { id: "password", label: "Đổi Mật Khẩu", icon: Lock },
    { id: "notifications", label: "Thông Báo", icon: Bell },
    { id: "account", label: "Quản Lý Tài Khoản", icon: User },
  ];

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!user || user.role !== "seller") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-600">Bạn không có quyền truy cập trang này.</p>
        <Link to="/login-seller" className="text-blue-600 hover:underline">
          Đăng nhập Seller
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Cài Đặt Cửa Hàng</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý thông tin cửa hàng và tài khoản của bạn
          </p>
        </div>

        {/* Banner from register */}
        {isFromRegister && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800">Chào mừng bạn trở thành người bán!</p>
              <p className="text-sm text-blue-700 mt-1">
                Vui lòng hoàn thiện thông tin cửa hàng để bắt đầu bán hàng.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* TAB 1: Shop Profile */}
            {activeTab === "shop" && (
              <form onSubmit={handleShopSubmit} className="space-y-6">
                {/* Banner Preview */}
                {(shopForm.banner_url || shopForm.logo_url) && (
                  <div className="relative h-32 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl overflow-hidden mb-4">
                    {shopForm.banner_url && (
                      <img
                        src={shopForm.banner_url}
                        alt="Banner"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    )}
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      {shopForm.logo_url ? (
                        <img
                          src={shopForm.logo_url}
                          alt="Logo"
                          className="w-16 h-16 rounded-full border-2 border-white object-cover bg-white"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                          <Store className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <span className="text-white font-bold text-lg drop-shadow">
                        {shopForm.shop_name || "Tên cửa hàng"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Required Fields */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-red-500">*</span> Thông tin bắt buộc
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên cửa hàng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="shop_name"
                        value={shopForm.shop_name}
                        onChange={handleShopChange}
                        placeholder="VD: Shop Áo Sơ Mi Cao Cấp"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address_line"
                        value={shopForm.address_line}
                        onChange={handleShopChange}
                        placeholder="VD: 123 Nguyễn Trãi, Q1, TP.HCM"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả cửa hàng <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={shopForm.description}
                      onChange={handleShopChange}
                      rows={3}
                      placeholder="Giới thiệu ngắn gọn về cửa hàng của bạn..."
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Optional Fields */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Thông tin bổ sung
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logo cửa hàng (URL)
                      </label>
                      <input
                        type="url"
                        name="logo_url"
                        value={shopForm.logo_url}
                        onChange={handleShopChange}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Banner cửa hàng (URL)
                      </label>
                      <input
                        type="url"
                        name="banner_url"
                        value={shopForm.banner_url}
                        onChange={handleShopChange}
                        placeholder="https://example.com/banner.png"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email cửa hàng
                      </label>
                      <input
                        type="email"
                        name="shop_email"
                        value={shopForm.shop_email}
                        onChange={handleShopChange}
                        placeholder="shop@example.com"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="shop_phone"
                        value={shopForm.shop_phone}
                        onChange={handleShopChange}
                        placeholder="0xxx xxx xxx"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giờ hoạt động
                      </label>
                      <input
                        type="text"
                        name="operating_hours"
                        value={shopForm.operating_hours}
                        onChange={handleShopChange}
                        placeholder="VD: 8:00 - 22:00 (Thứ 2 - Thứ 7)"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Policies */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Chính sách cửa hàng
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chính sách vận chuyển
                      </label>
                      <textarea
                        name="shipping_policy"
                        value={shopForm.shipping_policy}
                        onChange={handleShopChange}
                        rows={2}
                        placeholder="VD: Giao hàng trong 2-5 ngày, miễn phí vận chuyển cho đơn từ 500.000đ"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chính sách đổi/trả hàng
                      </label>
                      <textarea
                        name="return_policy"
                        value={shopForm.return_policy}
                        onChange={handleShopChange}
                        rows={2}
                        placeholder="VD: Đổi trả trong 7 ngày nếu sản phẩm lỗi từ nhà sản xuất"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? "Đang lưu..." : "Lưu Thông Tin"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Change Password */}
            {activeTab === "password" && (
              <form onSubmit={handlePasswordSubmit} className="max-w-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Đổi Mật Khẩu"}
                </button>
              </form>
            )}

            {/* TAB 3: Notifications */}
            {activeTab === "notifications" && (
              <div className="max-w-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Chọn các thông báo bạn muốn nhận từ cửa hàng.
                </p>

                {[
                  { key: "newOrder", label: "Nhận thông báo khi có đơn hàng mới" },
                  { key: "customerMessage", label: "Nhận thông báo khi khách hàng nhắn tin" },
                  { key: "reviewEmail", label: "Nhận email khi có đánh giá mới" },
                  { key: "weeklyReport", label: "Nhận email báo cáo doanh thu hàng tuần" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => handleNotificationToggle(item.key)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notifications[item.key] ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notifications[item.key] ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    * Các cài đặt thông báo được lưu trên trình duyệt của bạn.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: Account Management */}
            {activeTab === "account" && (
              <div className="space-y-6">
                {/* Account Info */}
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-4">Thông tin tài khoản</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vai trò:</span>
                      <span className="text-sm font-medium text-blue-600">
                        Người Bán (Seller)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ngày tham gia:</span>
                      <span className="text-sm font-medium">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-3">
                  <Link
                    to="/profile"
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <span className="text-sm font-medium">Xem trang hồ sơ cá nhân</span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </Link>
                  <Link
                    to="/seller"
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <span className="text-sm font-medium">Quay lại trang quản lý</span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </Link>
                </div>

                {/* Logout */}
                <div className="pt-4 border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition font-medium"
                  >
                    Đăng Xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
