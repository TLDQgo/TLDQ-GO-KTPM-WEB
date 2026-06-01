import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Camera,
  Clock,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Store,
  UserRound,
  XCircle,
} from "lucide-react";
import authApi from "../api/authApi";
import useAuthStore from "../store/useAuthStore";

const DEFAULT_PERSONAL_AVATAR =
  "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg";

function SectionHeading({ title }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
        {title}
      </h3>
    </div>
  );
}

function ProfileField({
  label,
  icon: Icon,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          {...props}
          disabled={disabled}
          className={`h-[52px] w-full rounded-xl border px-4 pl-12 text-sm font-medium outline-none transition duration-200 ${
            disabled
              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
              : "border-slate-200 bg-white text-slate-800 shadow-sm hover:border-blue-200 focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
          }`}
        />
      </span>
    </label>
  );
}

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
    <div className="min-h-screen bg-[#f4f8ff] px-4 py-8 text-slate-900 sm:py-12">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-6xl rounded-[20px] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] ring-1 ring-blue-100/80 sm:p-8 lg:p-10"
      >
        <div className="mb-10 flex flex-col gap-5 border-b border-blue-100/80 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              Trung tâm tài khoản
            </div>
            <h1 className="text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
              Hồ sơ cá nhân
            </h1>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
            <UserRound className="h-4 w-4 text-blue-600" />
            {isSeller ? "Tài khoản người bán" : "Tài khoản khách hàng"}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <aside className="flex h-fit flex-col items-center rounded-[20px] border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-6 text-center shadow-[0_18px_48px_rgba(37,99,235,0.10)]">
            <div className="rounded-full bg-gradient-to-br from-blue-300 via-sky-100 to-white p-1.5 shadow-[0_20px_45px_rgba(37,99,235,0.20)]">
              <img
                src={personalAvatarPreview || DEFAULT_PERSONAL_AVATAR}
                alt="Avatar cá nhân"
                className="h-44 w-44 rounded-full border-4 border-white object-cover sm:h-48 sm:w-48"
                onError={(event) => {
                  event.currentTarget.src = DEFAULT_PERSONAL_AVATAR;
                }}
              />
            </div>

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
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md active:translate-y-0"
            >
              <Camera className="h-4 w-4" />
              Thay ảnh đại diện
            </button>

            <div className="mt-6 w-full rounded-2xl border border-blue-100 bg-white/80 px-4 py-3 text-left">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                Trạng thái
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                Hồ sơ đang hoạt động
              </p>
            </div>
          </aside>

          <div className="space-y-9">
            <section>
              <SectionHeading title="Thông tin cơ bản" />
              <div className="grid gap-5">
                <ProfileField
                  label="Email"
                  icon={Mail}
                  type="text"
                  value={profileUser.email || ""}
                  disabled
                />
                <ProfileField
                  label="Họ tên"
                  icon={UserRound}
                  name="full_name"
                  value={personalForm.full_name}
                  onChange={handlePersonalChange}
                  placeholder="Nhập họ tên"
                />
              </div>
            </section>

            <section className="border-t border-blue-100/80 pt-8">
              <SectionHeading title="Thông tin liên hệ" />
              <div className="grid gap-5">
                <ProfileField
                  label="Số điện thoại"
                  icon={Phone}
                  name="phone"
                  value={personalForm.phone}
                  onChange={handlePersonalChange}
                  placeholder="Nhập số điện thoại"
                />
                <ProfileField
                  label="Địa chỉ"
                  icon={MapPin}
                  name="address_line"
                  value={personalForm.address_line}
                  onChange={handlePersonalChange}
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </section>
          </div>
        </div>

        <div className="mt-10 border-t border-blue-100/80 pt-7">
          <div className="mx-auto flex w-full max-w-[320px] flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_16px_34px_rgba(37,99,235,0.34)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[180px]"
            >
              <Save className="h-4 w-4" />
              {saving ? "Đang lưu..." : "Lưu thông tin"}
            </button>

            <Link
              to="/change-password"
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md active:translate-y-0 sm:w-auto sm:min-w-[180px]"
            >
              <KeyRound className="h-4 w-4" />
              Đổi mật khẩu
            </Link>

            {isSeller ? (
              <Link
                to="/seller"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md active:translate-y-0 sm:w-auto sm:min-w-[190px]"
              >
                <Store className="h-4 w-4" />
                Quay lại cửa hàng
              </Link>
            ) : user?.seller_upgrade_status === "pending" ? (
              <div className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-orange-50 border border-orange-300 px-6 py-3 text-sm font-semibold text-orange-600 sm:w-auto sm:min-w-[190px]">
                <Clock className="h-4 w-4" />
                Đang chờ phê duyệt
              </div>
            ) : user?.seller_upgrade_status === "rejected" ? (
              <div className="flex flex-col gap-1 sm:w-auto sm:min-w-[190px]">
                <div className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-300 px-6 py-2 text-sm font-semibold text-red-600">
                  <XCircle className="h-4 w-4 shrink-0" />
                  Yêu cầu bị từ chối
                </div>
                {user?.seller_upgrade_reject_reason && (
                  <p className="text-xs text-red-500 text-center">{user.seller_upgrade_reject_reason}</p>
                )}
                <Link
                  to="/register-seller"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-2 text-sm font-bold text-white hover:bg-orange-600 transition"
                >
                  Nộp lại yêu cầu
                </Link>
              </div>
            ) : (
              <Link
                to="/register-seller"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md active:translate-y-0 sm:w-auto sm:min-w-[190px]"
              >
                <Store className="h-4 w-4" />
                Đăng ký bán hàng
              </Link>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
