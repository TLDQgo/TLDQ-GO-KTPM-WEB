import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authApi from "../api/authApi";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success("Đổi mật khẩu thành công!");
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="max-w-md p-8 mx-auto bg-white shadow rounded-2xl">
        <div className="mb-6">
          <Link to="/profile" className="text-blue-600 hover:underline text-sm">
            ← Quay lại hồ sơ
          </Link>
        </div>

        <h2 className="pb-4 mb-6 text-2xl font-bold text-gray-800 border-b">
          Đổi mật khẩu
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu hiện tại"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Xác nhận mật khẩu mới
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showPassword" className="text-sm text-gray-600">
              Hiển thị mật khẩu
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-bold text-white transition bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-500">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
