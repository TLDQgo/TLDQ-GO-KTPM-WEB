import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../components/common/Input";
import authApi from "../api/authApi";

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");
  const [fullName, setFullName] = useState("");
  const [shopName, setShopName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isSeller = role === "seller";

  const title = useMemo(
    () => (isSeller ? "Đăng ký seller" : "Đăng ký tài khoản"),
    [isSeller],
  );

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (isSeller && !shopName.trim()) {
      toast.error("Vui lòng nhập tên cửa hàng.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email,
        password,
        full_name: fullName,
        role,
      };

      if (isSeller) {
        payload.shop_name = shopName;
        payload.address_line = addressLine;
      }

      const res = await authApi.register(payload);
      toast.success(res.message || "Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-100 px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/5 lg:grid-cols-2">
        <div className="hidden flex-col justify-center bg-gradient-to-br from-blue-700 to-orange-500 p-10 text-white lg:flex">
          <h1 className="text-4xl font-black leading-tight">
            Hệ thống
          </h1>
          <h1 className="text-4xl font-black leading-tight">
            Thương mại điện tử <span style={{ color: "yellow" }}>Bàn Ghế Công Thái Học</span>
          </h1>
          <p>Sức khoẻ của bạn là niềm vui của chúng tôi</p>

        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-lg">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-slate-900">Đăng ký tài khoản</h2>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${!isSeller ? "bg-white text-blue-700 shadow" : "text-slate-500"
                  }`}
              >
                Khách hàng
              </button>
              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${isSeller ? "bg-orange-500 text-white shadow" : "text-slate-500"
                  }`}
              >
                Seller
              </button>
            </div>

            <div className="space-y-4">
              <Input
                placeholder={isSeller ? "Tên hiển thị cá nhân" : "Họ và tên"}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              {isSeller && (
                <>
                  <Input
                    placeholder="Tên cửa hàng"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                  <Input
                    placeholder="Địa chỉ cửa hàng"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                  />
                </>
              )}

              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  placeholder="Mật khẩu"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  placeholder="Xác nhận mật khẩu"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition ${isSeller
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-blue-600 hover:bg-blue-700"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {loading ? "Đang xử lý..." : isSeller ? "Đăng ký seller" : "Đăng ký"}
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="flex-1 rounded-xl border border-blue-200 px-4 py-3 text-center font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  Đã có tài khoản
                </Link>
                <Link
                  to="/login-seller"
                  className="flex-1 rounded-xl border border-orange-200 px-4 py-3 text-center font-semibold text-orange-600 transition hover:bg-orange-50"
                >
                  Đăng nhập seller
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
