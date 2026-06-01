import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Clock, Eye, EyeOff, Loader2, Rocket, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import authApi from "../api/authApi";
import useAuthStore from "../store/useAuthStore";

const INPUT_CLS = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition placeholder-gray-400";
const INPUT_DISABLED_CLS = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed outline-none";

export default function RegisterSeller() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isCustomerLoggedIn = user?.role === "customer";
  const upgradeStatus = user?.seller_upgrade_status;

  const [form, setForm] = useState({
    personalName: user?.full_name || "",
    shopName: "",
    email: user?.email || "",
    phone: user?.phone || "",
    addressLine: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isCustomerLoggedIn) return;
    setForm((prev) => ({
      ...prev,
      personalName: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    }));
  }, [isCustomerLoggedIn, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const normalizedPersonalName = form.personalName.trim();
    const normalizedShopName = form.shopName.trim();
    const normalizedAddressLine = form.addressLine.trim();

    if (!normalizedPersonalName) {
      toast.error("Vui lòng nhập tên hiển thị cá nhân.");
      return;
    }

    if (!normalizedShopName) {
      toast.error("Tên shop là bắt buộc");
      return;
    }

    if (!normalizedAddressLine) {
      toast.error("Địa chỉ cửa hàng là bắt buộc");
      return;
    }

    setSubmitting(true);
    try {
      if (isCustomerLoggedIn) {
        const res = await authApi.upgradeSeller({
          phone: form.phone,
          full_name: normalizedPersonalName,
          shop_name: normalizedShopName,
          address_line: normalizedAddressLine,
        });
        if (res?.user) setUser(res.user);
        toast.info("Yêu cầu đã được gửi! Vui lòng chờ admin xem xét và phê duyệt.");
        navigate("/profile");
        return;
      }

      if (form.password !== form.confirmPassword) { toast.error("Mật khẩu không khớp!"); return; }

      const res = await authApi.registerSeller({
        email: form.email.trim(),
        password: form.password,
        phone: form.phone,
        full_name: normalizedPersonalName,
        shop_name: normalizedShopName,
        address_line: normalizedAddressLine,
      });
      toast.success(res?.message || "Đăng ký seller thành công! Vui lòng đăng nhập để tiếp tục.");
      navigate("/login-seller");
    } catch (err) {
      toast.error(err?.response?.data?.message || (isCustomerLoggedIn ? "Nâng cấp thất bại" : "Đăng ký thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  // Customer đang chờ duyệt — hiển thị màn hình pending
  if (isCustomerLoggedIn && upgradeStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-10 text-center">
          <div className="flex justify-center mb-4">
            <Clock className="w-16 h-16 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đang chờ phê duyệt</h2>
          <p className="text-sm text-gray-500 mb-6">
            Yêu cầu nâng cấp Seller của bạn đã được gửi. Admin sẽ xem xét và phê duyệt trong thời gian sớm nhất.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition"
          >
            Về trang cá nhân
          </button>
        </div>
      </div>
    );
  }

  // Customer bị từ chối — hiển thị lý do và cho phép nộp lại
  if (isCustomerLoggedIn && upgradeStatus === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-10 text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Yêu cầu bị từ chối</h2>
          {user?.seller_upgrade_reject_reason && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">
              Lý do: {user.seller_upgrade_reject_reason}
            </p>
          )}
          <p className="text-sm text-gray-500 mb-6">
            Bạn có thể điều chỉnh thông tin và nộp lại yêu cầu.
          </p>
          <button
            onClick={() => {
              setUser({ ...user, seller_upgrade_status: "none", seller_upgrade_reject_reason: undefined });
            }}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition"
          >
            Nộp lại yêu cầu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-center items-center bg-orange-500 text-white p-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-3">Bắt đầu bán hàng!</h2>
          <p className="text-center text-sm text-orange-100 leading-relaxed">
            Tạo cửa hàng và tiếp cận hàng ngàn<br />khách hàng ngay hôm nay.
          </p>
          <div className="mt-6 flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 text-xs text-orange-100">
            Miễn phí — Không cần phí mở cửa hàng
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-8 md:p-10 overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            {isCustomerLoggedIn ? "Nâng cấp tài khoản Seller" : "Đăng ký Seller"}
          </h1>
          <p className="text-sm text-gray-500 text-center mb-5">
            {isCustomerLoggedIn ? "Điền thông tin để gửi yêu cầu nâng cấp lên Seller" : "Điền thông tin để tạo cửa hàng của bạn"}
          </p>

          {isCustomerLoggedIn && (
            <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
              Yêu cầu sẽ được admin xem xét trước khi tài khoản được nâng cấp.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="personalName"
              placeholder="Tên hiển thị cá nhân"
              value={form.personalName}
              onChange={handleChange}
              className={INPUT_CLS}
              required
            />

            <input
              type="text"
              name="shopName"
              placeholder="Tên cửa hàng"
              value={form.shopName}
              onChange={handleChange}
              className={INPUT_CLS}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className={isCustomerLoggedIn ? INPUT_DISABLED_CLS : INPUT_CLS}
              disabled={isCustomerLoggedIn}
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={handleChange}
              className={INPUT_CLS}
              required
            />

            <input
              type="text"
              name="addressLine"
              placeholder="Địa chỉ cửa hàng"
              value={form.addressLine}
              onChange={handleChange}
              className={INPUT_CLS}
              required
            />

            {!isCustomerLoggedIn && (
              <>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                    className={INPUT_CLS}
                    required
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
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Xác nhận mật khẩu"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={INPUT_CLS}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Đang xử lý..." : isCustomerLoggedIn ? "Nâng cấp lên Seller" : "Đăng ký bán hàng"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Đã có tài khoản Seller?{" "}
              <Link to="/login-seller" className="text-orange-500 font-medium hover:underline">
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}
