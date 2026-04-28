import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import authApi from "../api/authApi";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      toast.success("Đặt lại mật khẩu thành công!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden lg:flex w-1/2 bg-blue-600 text-white pt-[200px] justify-center">
          <div className="px-10">
            <h1 className="text-4xl font-bold leading-tight">
              Hệ thống <br />
              Thương mại điện tử <span className="text-yellow-400">Bàn Ghế Công Thái Học</span>
            </h1>
            <p className="mt-4">Sức khoẻ của bạn là niềm vui của chúng tôi</p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex pt-[100px] justify-center bg-gray-50">
          <div className="w-full max-w-md p-6 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">Link không hợp lệ</h2>
            <p className="mb-6 text-gray-600">
              Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Yêu cầu link mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex w-1/2 bg-blue-600 text-white pt-[200px] justify-center">
        <div className="px-10">
          <h1 className="text-4xl font-bold leading-tight">
            Hệ thống <br />
            Thương mại điện tử <span className="text-yellow-400">Bàn Ghế Công Thái Học</span>
          </h1>
          <p className="mt-4">Sức khoẻ của bạn là niềm vui của chúng tôi</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex pt-[100px] justify-center bg-gray-50">
        <div className="w-full max-w-md p-6">
          <h2 className="mb-2 text-2xl font-semibold text-center">Đặt lại mật khẩu</h2>
          <p className="mb-6 text-center text-gray-500">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? "🙈" : "👁"}
                </span>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 py-3 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500">
            <Link to="/login" className="text-blue-600 hover:underline">
              Quay lại trang đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
