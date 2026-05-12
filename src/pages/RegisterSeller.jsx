import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authApi from "../api/authApi";
import useAuthStore from "../store/useAuthStore";

export default function RegisterSeller() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isCustomerLoggedIn = user?.role === "customer";

  const [form, setForm] = useState({
    personalName: user?.full_name || "",
    shopName: "",
    email: user?.email || "",
    phone: user?.phone || "",
    addressLine: "",
    password: "",
    confirmPassword: "",
  });
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!form.personalName.trim()) {
      toast.error("Vui lòng nhập tên hiển thị cá nhân.");
      return;
    }

    if (!form.shopName.trim()) {
      toast.error("Vui lòng nhập tên cửa hàng.");
      return;
    }

    if (!form.addressLine.trim()) {
      toast.error("Vui lòng nhập địa chỉ cửa hàng.");
      return;
    }

    try {
      setSubmitting(true);

      if (isCustomerLoggedIn) {
        const res = await authApi.upgradeSeller({
          phone: form.phone,
          full_name: form.personalName,
          shop_name: form.shopName,
          address_line: form.addressLine,
        });

        if (res?.token) {
          localStorage.setItem("token", res.token);
        }
        if (res?.user) {
          setUser(res.user);
        }
        window.dispatchEvent(new Event("auth-change"));

        toast.success(res?.message || "Nâng cấp tài khoản seller thành công!");
        navigate("/seller/settings?from=register");
        return;
      }

      if (form.password !== form.confirmPassword) {
        toast.error("Mật khẩu không khớp!");
        return;
      }

      const res = await authApi.registerSeller({
        email: form.email,
        password: form.password,
        phone: form.phone,
        full_name: form.personalName,
        shop_name: form.shopName,
        address_line: form.addressLine,
      });

      toast.success(res?.message || "Đăng ký seller thành công!");
      navigate("/login-seller");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        (isCustomerLoggedIn
          ? "Nâng cấp tài khoản seller thất bại"
          : "Đăng ký seller thất bại"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-orange-100 px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/5 lg:grid-cols-2">
        <div className="hidden flex-col justify-center bg-gradient-to-br from-blue-700 to-orange-500 p-10 text-white lg:flex">
          <h1 className="text-4xl font-black leading-tight">
            Bắt đầu bán hàng 🚀
          </h1>
          <p className="mt-4 max-w-md text-white/85">
            Tạo cửa hàng của bạn và tiếp cận hàng ngàn khách hàng ngay hôm nay.
          </p>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-slate-900">
                {isCustomerLoggedIn ? "Nâng cấp lên seller" : "Đăng ký seller"}
              </h2>
            </div>

            {isCustomerLoggedIn && (
              <div className="mb-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                Bạn đang dùng tài khoản customer. Chỉ cần điền tên shop và địa chỉ để nâng cấp.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="personalName"
                placeholder="Tên hiển thị cá nhân"
                value={form.personalName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                required
              />

              <input
                type="text"
                name="shopName"
                placeholder="Tên cửa hàng"
                value={form.shopName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                required
              />

              <input
                type="text"
                name="addressLine"
                placeholder="Địa chỉ cửa hàng"
                value={form.addressLine}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                required
                disabled={isCustomerLoggedIn}
              />

              <input
                type="text"
                name="phone"
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                required
              />

              {!isCustomerLoggedIn && (
                <>
                  <input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    required
                  />

                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Xác nhận mật khẩu"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    required
                  />
                </>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Đang xử lý..."
                  : isCustomerLoggedIn
                    ? "Nâng cấp thành seller"
                    : "Đăng ký seller"}
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  to="/login-seller"
                  className="rounded-xl border border-orange-200 px-4 py-3 text-center font-semibold text-orange-600 transition hover:bg-orange-50"
                >
                  Đăng nhập seller
                </Link>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Quay lại login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
