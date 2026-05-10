import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import authApi from "../api/authApi";
import useAuthStore from "../store/useAuthStore";
import { Lock, User as UserIcon, Phone, MapPin, ShieldCheck, Eye, EyeOff, Edit3, Key } from "lucide-react";
import Modal from "../components/common/Modal";

const Profile = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isSeller = user?.role === "seller";

  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address_line: "",
  });

  const [pwdData, setPwdData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || "");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        address_line:
          user.customerProfile?.address_line ||
          user.sellerProfile?.address_line ||
          "",
      });
      setAvatarPreview(user.avatar_url || "");
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePwdChange = (e) => {
    setPwdData({ ...pwdData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    try {
      const uploadData = new FormData();
      uploadData.append("avatar", file);
      const res = await authApi.uploadAvatar(uploadData);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem("user", JSON.stringify(res.user));
        toast.success("Cập nhật ảnh đại diện thành công");
      }
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        address_line: formData.address_line,
      };
      const res = await authApi.updateProfile(payload);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem("user", JSON.stringify(res.user));
      }
      window.dispatchEvent(new Event("auth-change"));
      toast.success(res.message || "Cập nhật hồ sơ thành công!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }
    try {
      setPwdLoading(true);
      const res = await authApi.changePassword(pwdData.currentPassword, pwdData.newPassword);
      toast.success(res.message || "Đổi mật khẩu thành công!");
      setPwdData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsPwdModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: User Card */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 ring-4 ring-blue-50">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-300 text-5xl font-bold">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full text-white shadow-lg border-2 border-white group-hover:scale-110 transition">
                <Edit3 size={16} />
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            
            <div className="text-center mt-6">
              <h2 className="text-2xl font-bold text-gray-800">{user?.full_name || "Thành viên TLDQ-GO"}</h2>
              <p className="text-gray-500 font-medium">{user?.email}</p>
              <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${isSeller ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                <ShieldCheck size={14} />
                {user?.role === "seller" ? "Nhà bán hàng" : "Khách hàng"}
              </div>
            </div>

            <div className="w-full border-t border-gray-100 mt-8 pt-6 space-y-4">
               <div className="flex items-center gap-4 text-gray-600 text-sm">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                    <Phone size={18} />
                  </div>
                  <span>{user?.phone || "Chưa cập nhật SĐT"}</span>
               </div>
               <div className="flex items-center gap-4 text-gray-600 text-sm">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                    <MapPin size={18} />
                  </div>
                  <span className="line-clamp-2">{user?.customerProfile?.address_line || user?.sellerProfile?.address_line || "Chưa cập nhật địa chỉ"}</span>
               </div>
            </div>

            <div className="w-full mt-8 flex flex-col gap-3">
              <button 
                onClick={() => setIsPwdModalOpen(true)}
                className="w-full py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-2xl font-bold shadow-sm hover:bg-orange-50 transition flex items-center justify-center gap-2"
              >
                <Key size={18} />
                Đổi mật khẩu
              </button>

              {isSeller && (
                <Link to="/seller" className="w-full">
                  <button className="w-full py-3 bg-green-600 text-white rounded-2xl font-bold shadow-md hover:bg-green-700 transition flex items-center justify-center gap-2">
                    <Lock size={18} />
                    Kênh người bán
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Personal Info */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <UserIcon size={20} />
               </div>
               <h3 className="text-xl font-bold text-gray-800">Cài đặt hồ sơ cá nhân</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Họ và tên</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm"
                    placeholder="09xx xxx xxx"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Địa chỉ thường trú</label>
                <textarea
                  name="address_line"
                  value={formData.address_line}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm resize-none"
                  placeholder="Số nhà, Tên đường, Quận/Huyện..."
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-10 py-4 font-bold text-white transition rounded-2xl shadow-lg ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                >
                  {loading ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        isOpen={isPwdModalOpen}
        onClose={() => setIsPwdModalOpen(false)}
        title="Đổi mật khẩu bảo mật"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleChangePassword} className="space-y-6 pt-2">
           <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                name="currentPassword"
                value={pwdData.currentPassword}
                onChange={handlePwdChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none transition"
                placeholder="Nhập mật khẩu đang dùng"
                required
              />
           </div>

           <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                value={pwdData.newPassword}
                onChange={handlePwdChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none transition"
                placeholder="Mật khẩu mới ít nhất 6 ký tự"
                required
              />
           </div>

           <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                name="confirmPassword"
                value={pwdData.confirmPassword}
                onChange={handlePwdChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none transition"
                placeholder="Nhập lại mật khẩu mới"
                required
              />
           </div>

           <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPwdModalOpen(false)}
                className="w-1/2 py-3 border-2 border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={pwdLoading}
                className={`w-1/2 py-3 font-bold text-white transition rounded-xl shadow-md ${pwdLoading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}
              >
                {pwdLoading ? "Đang lưu..." : "Xác nhận"}
              </button>
           </div>
        </form>
      </Modal>

    </div>
  );
};

export default Profile;
