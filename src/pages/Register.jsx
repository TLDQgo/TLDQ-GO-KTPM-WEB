import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import authApi from "../api/authApi";

const INPUT_CLS = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [role, setRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (password !== rePassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({ email, password, full_name: fullName, role });
      toast.success(res.message || "Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-center items-center bg-blue-600 text-white p-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-3">Tạo tài khoản mới</h2>
          <p className="text-center text-sm text-blue-100 leading-relaxed">
            Hệ thống Thương mại điện tử<br />
            <span className="font-semibold text-yellow-300">Bàn Ghế Công Thái Học</span>
          </p>
          <p className="mt-4 text-xs text-blue-200 text-center">Sức khoẻ của bạn là niềm vui của chúng tôi</p>
        </div>

        {/* RIGHT */}
        <div className="p-8 md:p-10">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Đăng ký</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Điền thông tin bên dưới để tạo tài khoản</p>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onKeyDown={handleKeyDown}
              className={INPUT_CLS}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className={INPUT_CLS}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className={INPUT_CLS}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showRePassword ? "text" : "password"}
                placeholder="Xác nhận mật khẩu"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className={INPUT_CLS}
              />
              <button
                type="button"
                onClick={() => setShowRePassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showRePassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Role select */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              {[
                { value: "customer", label: "Khách hàng" },
                { value: "seller",   label: "Nhà bán hàng" },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                    role === r.value
                      ? r.value === "seller" ? "bg-orange-500 text-white shadow-sm" : "bg-blue-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
