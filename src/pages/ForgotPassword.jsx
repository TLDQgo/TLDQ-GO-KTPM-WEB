import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import authApi from "../api/authApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Định dạng email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setEmailSent(true);
      toast.success("Đã gửi link đặt lại mật khẩu đến email của bạn!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi gửi email");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
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
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">Kiểm tra email của bạn</h2>
            <p className="mb-6 text-gray-600">
              Chúng tôi đã gửi link đặt lại mật khẩu đến email <strong>{email}</strong>
            </p>
            <p className="mb-6 text-sm text-gray-500">
              Vui lòng kiểm tra hộp thư và nhấn vào link để đặt lại mật khẩu.
              <br />
              Link sẽ hết hạn sau 15 phút.
            </p>
            <p className="mb-4 text-sm text-gray-500">
              Không nhận được email? Kiểm tra thư mục Spam hoặc{" "}
              <button
                onClick={() => setEmailSent(false)}
                className="text-blue-600 hover:underline"
              >
                thử lại
              </button>
            </p>
            <Link
              to="/login"
              className="inline-block mt-4 text-blue-600 hover:underline"
            >
              Quay lại trang đăng nhập
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
          <h2 className="mb-2 text-2xl font-semibold text-center">Quên mật khẩu</h2>
          <p className="mb-6 text-center text-gray-500">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 py-3 disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500">
            Nhớ mật khẩu rồi?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
