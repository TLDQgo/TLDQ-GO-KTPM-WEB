import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import authApi from "../api/authApi";
import useAuthStore from "../store/useAuthStore";

const DEFAULT_PERSONAL_AVATAR =
  "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const avatarInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);

  const [personalForm, setPersonalForm] = useState({
    full_name: "",
    phone: "",
    address_line: "",
  });
  const [shopForm, setShopForm] = useState({
    shop_name: "",
  });

  const [personalAvatarFile, setPersonalAvatarFile] = useState(null);
  const [personalAvatarPreview, setPersonalAvatarPreview] = useState("");

  const isSeller = useMemo(() => profileUser?.role === "seller", [profileUser]);

  useEffect(() => {
    let alive = true;

    const loadProfile = async () => {
      if (!user) {
        toast.error("Vui lòng đăng nhập để xem hồ sơ.");
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getProfile();
        if (!alive) return;

        const nextUser = res.user || user;
        const nextCustomerProfile = res.customerProfile || null;
        const nextSellerProfile = res.sellerProfile || null;

        setProfileUser(nextUser);
        setCustomerProfile(nextCustomerProfile);
        setSellerProfile(nextSellerProfile);
        setUser(nextUser);

        setPersonalForm({
          full_name: nextUser.full_name || "",
          phone: nextUser.phone || "",
          address_line:
            nextCustomerProfile?.address_line ||
            nextSellerProfile?.address_line ||
            "",
        });

        setShopForm({
          shop_name: nextSellerProfile?.shop_name || nextUser.full_name || "",
        });

        setPersonalAvatarPreview(nextUser.avatar_url || DEFAULT_PERSONAL_AVATAR);
      } catch (error) {
        toast.error(error.response?.data?.message || "Không tải được hồ sơ.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      alive = false;
    };
  }, [setUser, user?._id]);

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleShopChange = (e) => {
    const { name, value } = e.target;
    setShopForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectPersonalAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ.");
      return;
    }

    setPersonalAvatarFile(file);
    setPersonalAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileUser) {
      toast.error("Không tìm thấy thông tin người dùng.");
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append("full_name", personalForm.full_name);
      payload.append("phone", personalForm.phone);
      payload.append("address_line", personalForm.address_line);

      if (personalAvatarFile) {
        payload.append("avatar", personalAvatarFile);
      }

      let res;
      if (isSeller) {
        payload.append("shop_name", shopForm.shop_name);
        res = await authApi.updateSellerProfile(payload);
      } else {
        res = await authApi.updateProfile(payload);
      }

      const nextUser = res.user || profileUser;
      setProfileUser(nextUser);
      setUser(nextUser);
      setCustomerProfile(res.customerProfile || customerProfile);
      setSellerProfile(res.sellerProfile || sellerProfile);

      setPersonalAvatarFile(null);
      setPersonalAvatarPreview(nextUser.avatar_url || DEFAULT_PERSONAL_AVATAR);

      toast.success(res.message || "Cập nhật hồ sơ thành công.");
      window.dispatchEvent(new Event("auth-change"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật hồ sơ thất bại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-6 py-4 shadow">Đang tải hồ sơ...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="text-lg font-semibold text-slate-900">Bạn chưa đăng nhập</p>
          <p className="mt-2 text-sm text-slate-500">
            Vui lòng đăng nhập để xem và chỉnh sửa hồ sơ.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-lg ring-1 ring-black/5">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900 flex items-center justify-center">Thông tin cá nhân</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
              <div className="flex flex-col items-center gap-4 rounded-3xl bg-slate-50 p-5">
                <img
                  src={personalAvatarPreview || DEFAULT_PERSONAL_AVATAR}
                  alt="Avatar cá nhân"
                  className="h-40 w-40 rounded-full object-cover shadow-md ring-4 ring-white"
                  onError={(event) => {
                    event.currentTarget.src = DEFAULT_PERSONAL_AVATAR;
                  }}
                />

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSelectPersonalAvatar}
                />

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  Thay ảnh đại diện
                </button>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="text"
                    value={profileUser.email || ""}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tên hiển thị
                  </label>
                  <input
                    name="full_name"
                    value={personalForm.full_name}
                    onChange={handlePersonalChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Số điện thoại
                  </label>
                  <input
                    name="phone"
                    value={personalForm.phone}
                    onChange={handlePersonalChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Địa chỉ
                  </label>
                  <input
                    name="address_line"
                    value={personalForm.address_line}
                    onChange={handlePersonalChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-6">
              <div className="flex flex-col gap-3 sm:w-full sm:max-w-[220px]">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu thông tin"}
                </button>

                <Link
                  to="/change-password"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
                >
                  Đổi mật khẩu
                </Link>

                {isSeller ? (
                  <Link
                    to="/seller"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Quay lại cửa hàng
                  </Link>
                ) : null}
              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
