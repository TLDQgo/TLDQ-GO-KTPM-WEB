import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Store, Lock, Bell, User, ChevronRight, CheckCircle, AlertCircle,
  Eye, EyeOff, Camera, X, MapPin, Mail, Phone, Clock, Truck, RotateCcw,
} from "lucide-react";
import authApi from "../../api/authApi";
import useAuthStore from "../../store/useAuthStore";

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "bg-gray-200" };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: 1, label: "Yếu", color: "bg-red-500" };
  if (s <= 3) return { score: 2, label: "Trung bình", color: "bg-yellow-400" };
  return { score: 3, label: "Mạnh", color: "bg-green-500" };
}

function shopCompleteness(form, assets) {
  const checks = [
    !!form.shop_name, !!form.address_line, !!form.description,
    !!form.shop_email, !!form.shop_phone, !!form.operating_hours,
    !!form.shipping_policy, !!form.return_policy,
    !!assets.logoPreview, !!assets.bannerPreview,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function SellerSettings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const isFromRegister = searchParams.get("from") === "register";
  const [activeTab, setActiveTab] = useState("shop");
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [shopForm, setShopForm] = useState({
    shop_name: "", description: "", address_line: "",
    shop_email: "", shop_phone: "", logo_url: "", banner_url: "",
    operating_hours: "", shipping_policy: "", return_policy: "",
  });
  const [shopAssets, setShopAssets] = useState({ logoPreview: "", bannerPreview: "" });
  const [shopFiles, setShopFiles] = useState({ logo: null, banner: null });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const [notifications, setNotifications] = useState({
    newOrder: true, customerMessage: true, reviewEmail: false, weeklyReport: false,
  });

  useEffect(() => {
    const fetchShopData = async () => {
      if (!user || user.role !== "seller") { setInitialLoading(false); return; }
      try {
        const res = await authApi.getShopSetupStatus();
        if (res?.profile) {
          const p = res.profile;
          setShopForm({
            shop_name: p.shop_name || "", description: p.description || "",
            address_line: p.address_line || "", shop_email: p.shop_email || "",
            shop_phone: p.shop_phone || "", logo_url: p.logo_url || "",
            banner_url: p.banner_url || "", operating_hours: p.operating_hours || "",
            shipping_policy: p.shipping_policy || "", return_policy: p.return_policy || "",
          });
          setShopAssets({ logoPreview: p.logo_url || "", bannerPreview: p.banner_url || "" });
          setShopFiles({ logo: null, banner: null });
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
    setShopForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectShopAsset = (field) => (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ");
      return;
    }
    const previewKey = field === "logo" ? "logoPreview" : "bannerPreview";
    setShopFiles((prev) => ({ ...prev, [field]: file }));
    setShopAssets((prev) => ({ ...prev, [previewKey]: URL.createObjectURL(file) }));
  };

  const handleRemoveAsset = (field) => {
    const previewKey = field === "logo" ? "logoPreview" : "bannerPreview";
    const urlKey = field === "logo" ? "logo_url" : "banner_url";
    setShopFiles((prev) => ({ ...prev, [field]: null }));
    setShopAssets((prev) => ({ ...prev, [previewKey]: "" }));
    setShopForm((prev) => ({ ...prev, [urlKey]: "" }));
    if (field === "logo" && logoInputRef.current) logoInputRef.current.value = "";
    if (field === "banner" && bannerInputRef.current) bannerInputRef.current.value = "";
  };

  const handleShopSubmit = async (e) => {
    e.preventDefault();
    if (!shopForm.shop_name.trim()) { toast.error("Tên cửa hàng là bắt buộc"); return; }
    if (!shopForm.address_line.trim()) { toast.error("Địa chỉ cửa hàng là bắt buộc"); return; }
    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(shopForm).forEach(([key, value]) => payload.append(key, value ?? ""));
      if (shopFiles.logo) payload.append("logo", shopFiles.logo);
      if (shopFiles.banner) payload.append("banner", shopFiles.banner);
      const res = await authApi.updateShopSettings(payload);
      if (res?.profile) {
        const updatedUser = { ...user, sellerProfile: res.profile };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setShopAssets({
          logoPreview: res.profile.logo_url || "",
          bannerPreview: res.profile.banner_url || "",
        });
        setShopFiles({ logo: null, banner: null });
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
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) { toast.error("Vui lòng nhập mật khẩu hiện tại"); return; }
    if (!passwordForm.newPassword) { toast.error("Vui lòng nhập mật khẩu mới"); return; }
    if (passwordForm.newPassword.length < 6) { toast.error("Mật khẩu mới phải có ít nhất 6 ký tự"); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error("Mật khẩu mới không khớp"); return; }
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
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login-seller");
  };

  const tabs = [
    { id: "shop", label: "Cửa Hàng", icon: Store },
    { id: "password", label: "Mật Khẩu", icon: Lock },
    { id: "notifications", label: "Thông Báo", icon: Bell },
    { id: "account", label: "Tài Khoản", icon: User },
  ];

  const pwStrength = passwordStrength(passwordForm.newPassword);
  const completeness = shopCompleteness(shopForm, shopAssets);
  const passwordsMatch =
    !!passwordForm.confirmPassword &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Cài Đặt Cửa Hàng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý thông tin và tuỳ chọn cho cửa hàng của bạn
          </p>
        </div>

        {isFromRegister && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800 text-sm">
                Chào mừng bạn trở thành người bán!
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                Hoàn thiện thông tin cửa hàng để bắt đầu bán hàng ngay.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab navigation */}
          <div className="border-b border-gray-100 bg-gray-50/60">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                      activeTab === tab.id
                        ? "text-blue-600 border-blue-600 bg-white"
                        : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/70"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {/* ===== TAB: SHOP ===== */}
            {activeTab === "shop" && (
              <form onSubmit={handleShopSubmit} className="space-y-6">
                {/* Completeness bar */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Mức độ hoàn thiện hồ sơ
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        completeness === 100 ? "text-green-600" : "text-blue-600"
                      }`}
                    >
                      {completeness}%
                    </span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden border border-blue-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        completeness === 100 ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                  {completeness < 100 && (
                    <p className="text-xs text-blue-500 mt-1.5">
                      Điền đầy đủ thông tin để tăng độ tin cậy với khách hàng
                    </p>
                  )}
                </div>

                {/* Live preview */}
                <div className="relative rounded-xl overflow-hidden border border-gray-200 h-28">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-rose-500" />
                  {shopAssets.bannerPreview && (
                    <img
                      src={shopAssets.bannerPreview}
                      alt="Banner"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )}
                  {!shopAssets.bannerPreview && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white/40 text-xs">Chưa có ảnh banner</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-2.5 flex items-end gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-white overflow-hidden flex-shrink-0">
                      {shopAssets.logoPreview ? (
                        <img
                          src={shopAssets.logoPreview}
                          alt="Logo"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Store className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <span className="text-white font-semibold text-sm drop-shadow">
                      {shopForm.shop_name || (
                        <span className="opacity-40 font-normal italic">Tên cửa hàng</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Image uploads */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo cửa hàng
                    </label>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSelectShopAsset("logo")}
                    />
                    <div className="inline-block relative group">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-28 h-28 flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-all"
                      >
                        {shopAssets.logoPreview ? (
                          <>
                            <img
                              src={shopAssets.logoPreview}
                              alt="Logo"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                              <Camera className="w-5 h-5 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-gray-400">
                            <Camera className="w-7 h-7" />
                            <span className="text-xs font-medium">Tải logo</span>
                          </div>
                        )}
                      </button>
                      {shopAssets.logoPreview && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAsset("logo")}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-sm z-10"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Banner */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner cửa hàng
                    </label>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSelectShopAsset("banner")}
                    />
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="w-full h-28 flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-orange-400 hover:bg-orange-50 transition-all"
                      >
                        {shopAssets.bannerPreview ? (
                          <>
                            <img
                              src={shopAssets.bannerPreview}
                              alt="Banner"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                              <Camera className="w-5 h-5 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-gray-400">
                            <Camera className="w-7 h-7" />
                            <span className="text-xs font-medium">Tải banner</span>
                            <span className="text-[10px]">Khuyến nghị 16:6</span>
                          </div>
                        )}
                      </button>
                      {shopAssets.bannerPreview && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAsset("banner")}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-sm z-10"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic info */}
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Thông tin cơ bản
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Tên cửa hàng <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          name="shop_name"
                          value={shopForm.shop_name}
                          onChange={handleShopChange}
                          placeholder="VD: Shop Áo Sơ Mi Cao Cấp"
                          className="w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Địa chỉ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          name="address_line"
                          value={shopForm.address_line}
                          onChange={handleShopChange}
                          placeholder="VD: 123 Nguyễn Trãi, Q1, TP.HCM"
                          className="w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email cửa hàng
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="email"
                          name="shop_email"
                          value={shopForm.shop_email}
                          onChange={handleShopChange}
                          placeholder="shop@example.com"
                          className="w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="tel"
                          name="shop_phone"
                          value={shopForm.shop_phone}
                          onChange={handleShopChange}
                          placeholder="0xxx xxx xxx"
                          className="w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Giờ hoạt động
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          name="operating_hours"
                          value={shopForm.operating_hours}
                          onChange={handleShopChange}
                          placeholder="VD: 8:00 - 22:00 (Thứ 2 - Thứ 7)"
                          className="w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Mô tả cửa hàng <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs text-gray-400">
                        {shopForm.description.length}/300
                      </span>
                    </div>
                    <textarea
                      name="description"
                      value={shopForm.description}
                      onChange={handleShopChange}
                      rows={3}
                      maxLength={300}
                      placeholder="Giới thiệu ngắn gọn về cửa hàng của bạn..."
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Policies */}
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Chính sách cửa hàng
                  </p>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <Truck className="w-4 h-4 text-gray-400" />
                        Chính sách vận chuyển
                      </label>
                      <span className="text-xs text-gray-400">
                        {shopForm.shipping_policy.length}/200
                      </span>
                    </div>
                    <textarea
                      name="shipping_policy"
                      value={shopForm.shipping_policy}
                      onChange={handleShopChange}
                      rows={2}
                      maxLength={200}
                      placeholder="VD: Giao hàng trong 2-5 ngày, miễn phí vận chuyển cho đơn từ 500.000đ"
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <RotateCcw className="w-4 h-4 text-gray-400" />
                        Chính sách đổi/trả hàng
                      </label>
                      <span className="text-xs text-gray-400">
                        {shopForm.return_policy.length}/200
                      </span>
                    </div>
                    <textarea
                      name="return_policy"
                      value={shopForm.return_policy}
                      onChange={handleShopChange}
                      rows={2}
                      maxLength={200}
                      placeholder="VD: Đổi trả trong 7 ngày nếu sản phẩm lỗi từ nhà sản xuất"
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Save */}
                <div className="pt-4 border-t flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu Thông Tin"
                    )}
                  </button>
                  {completeness === 100 && (
                    <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Hồ sơ đầy đủ
                    </span>
                  )}
                </div>
              </form>
            )}

            {/* ===== TAB: PASSWORD ===== */}
            {activeTab === "password" && (
              <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-5">
                <p className="text-sm text-gray-500">
                  Sử dụng mật khẩu mạnh và không chia sẻ với ai để bảo vệ tài khoản.
                </p>

                {/* Current password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      type={showPw.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showPw.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPw.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordForm.newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              i <= pwStrength.score ? pwStrength.color : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Độ mạnh:{" "}
                        <span
                          className={`font-medium ${
                            pwStrength.score === 3
                              ? "text-green-600"
                              : pwStrength.score === 2
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {pwStrength.label}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showPw.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
                        passwordForm.confirmPassword
                          ? passwordsMatch
                            ? "border-green-400 focus:ring-green-400"
                            : "border-red-400 focus:ring-red-400"
                          : "focus:ring-blue-500"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordForm.confirmPassword && (
                    <p
                      className={`text-xs mt-1 font-medium ${
                        passwordsMatch ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {passwordsMatch ? "✓ Mật khẩu khớp" : "✗ Mật khẩu không khớp"}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    loading || (!!passwordForm.confirmPassword && !passwordsMatch)
                  }
                  className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đổi Mật Khẩu"
                  )}
                </button>
              </form>
            )}

            {/* ===== TAB: NOTIFICATIONS ===== */}
            {activeTab === "notifications" && (
              <div className="max-w-lg space-y-3">
                <p className="text-sm text-gray-500 mb-4">
                  Chọn loại thông báo bạn muốn nhận.
                </p>
                {[
                  {
                    key: "newOrder",
                    label: "Đơn hàng mới",
                    desc: "Nhận thông báo ngay khi có đơn đặt hàng mới",
                  },
                  {
                    key: "customerMessage",
                    label: "Tin nhắn từ khách",
                    desc: "Thông báo khi khách hàng gửi tin nhắn cho bạn",
                  },
                  {
                    key: "reviewEmail",
                    label: "Đánh giá mới (Email)",
                    desc: "Nhận email khi có đánh giá sản phẩm mới",
                  },
                  {
                    key: "weeklyReport",
                    label: "Báo cáo tuần (Email)",
                    desc: "Tổng kết doanh thu và hiệu suất bán hàng mỗi tuần",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleNotificationToggle(item.key)}
                  >
                    <div className="pr-4">
                      <p className="text-sm font-medium text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleNotificationToggle(item.key); }}
                      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${
                        notifications[item.key] ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          notifications[item.key] ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-400 pt-2">
                  * Cài đặt thông báo được lưu trên trình duyệt của bạn.
                </p>
              </div>
            )}

            {/* ===== TAB: ACCOUNT ===== */}
            {activeTab === "account" && (
              <div className="max-w-lg space-y-5">
                {/* Account card */}
                <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-bold">
                      {(user.email?.[0] || "S").toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{user.email}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      Người Bán
                    </span>
                  </div>
                </div>

                {/* Info rows */}
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {[
                    { label: "Email", value: user.email },
                    { label: "Vai trò", value: "Người Bán (Seller)" },
                    {
                      label: "Ngày tham gia",
                      value: user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                        : "N/A",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-center px-4 py-3 bg-white"
                    >
                      <span className="text-sm text-gray-500">{row.label}</span>
                      <span className="text-sm font-medium text-gray-800">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Quick links */}
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition"
                  >
                    <span className="text-sm font-medium text-gray-700">Hồ sơ cá nhân</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                  <Link
                    to="/seller"
                    className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Quay lại trang quản lý
                    </span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                </div>

                {/* Logout */}
                <div className="pt-2 border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 active:bg-red-100 transition font-medium"
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
