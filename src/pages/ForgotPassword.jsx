import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, KeyRound, MailCheck, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import authApi from "../api/authApi";

const INPUT_CLS = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400";

function AuthCard({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-center items-center bg-blue-600 text-white p-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-3">Khôi phục mật khẩu</h2>
          <p className="text-center text-sm text-blue-100 leading-relaxed">
            Hệ thống Thương mại điện tử<br />
            <span className="font-semibold text-yellow-300">Bàn Ghế Công Thái Học</span>
          </p>
          <p className="mt-4 text-xs text-blue-200 text-center">Sức khoẻ của bạn là niềm vui của chúng tôi</p>
        </div>
        {/* RIGHT */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error("Vui lòng nhập email"); return; }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) { toast.error("Định dạng email không hợp lệ"); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setEmailSent(true);
      toast.success("Đã gửi link đặt lại mật khẩu!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi khi gửi email");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthCard>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-2xl flex items-center justify-center mb-5">
            <MailCheck className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Kiểm tra email của bạn</h2>
          <p className="text-sm text-gray-500 mb-2">
            Chúng tôi đã gửi link đặt lại mật khẩu đến
          </p>
          <p className="font-semibold text-gray-800 mb-4">{email}</p>
          <p className="text-xs text-gray-400 mb-6">
            Link sẽ hết hạn sau 15 phút. Kiểm tra thư mục Spam nếu không thấy.
          </p>
          <button
            onClick={() => setEmailSent(false)}
            className="text-sm text-blue-600 hover:underline mb-4 block mx-auto"
          >
            Gửi lại email
          </button>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 hover:underline transition"
          >
            ← Quay lại trang đăng nhập
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-5">
        <KeyRound className="w-7 h-7 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Quên mật khẩu?</h2>
      <p className="text-sm text-gray-500 mb-6">
        Nhập email để nhận link đặt lại mật khẩu
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
          className={INPUT_CLS}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
        </button>
      </form>

      <p className="mt-5 text-sm text-center text-gray-500">
        Nhớ mật khẩu rồi?{" "}
        <Link to="/login" className="text-blue-600 font-medium hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
    </AuthCard>
  );
}
