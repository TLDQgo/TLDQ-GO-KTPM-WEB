import React, { useEffect, useState } from "react";
import { Bell, Mail, ShoppingCart, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import useAuthStore from "../../store/useAuthStore";

export default function HeaderSeller() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const [shopProfile, setShopProfile] = useState(user?.sellerProfile || null);
  const [fetchedSellerId, setFetchedSellerId] = useState(null);

  useEffect(() => {
    let alive = true;

    const loadShopProfile = async () => {
      if (!user || user.role !== "seller") {
        setShopProfile(null);
        setFetchedSellerId(null);
        return;
      }

      if (user.sellerProfile?.logo_url || fetchedSellerId === user._id) {
        setShopProfile(user.sellerProfile);
        return;
      }

      try {
        const res = await authApi.getShopSetupStatus();
        if (alive) setFetchedSellerId(user._id);
        if (!alive || !res?.profile) return;

        setShopProfile(res.profile);
        setUser({
          ...user,
          sellerProfile: res.profile,
        });
      } catch {
        if (alive) {
          setFetchedSellerId(user._id);
          setShopProfile(user.sellerProfile || null);
        }
      }
    };

    loadShopProfile();

    return () => {
      alive = false;
    };
  }, [fetchedSellerId, setUser, user]);

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login-seller");
  };

  // Lấy chữ cái đầu để hiển thị avatar fallback
  const shopName = shopProfile?.shop_name || user?.full_name || user?.email || "Nhà bán";
  const shopLogo = shopProfile?.logo_url || "";
  const initials = shopName.charAt(0).toUpperCase();

  const displayName = shopName;

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white shadow fixed top-0 left-0 right-0 z-50">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-red-500 rounded">
            🛒
          </div>
          <a href="/seller">
            <span className="text-lg font-semibold">Seller Center</span>
          </a>
        </div>

        {/* MENU ICON */}
        <Menu className="w-5 h-5 text-gray-600 cursor-pointer" />

        {/* TEXT */}
        <span className="text-gray-500 hidden md:block">Seller Center</span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5">
        {/* ICONS */}
        <div className="relative">
          <Mail className="w-5 h-5 text-gray-600 cursor-pointer" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-gray-600 cursor-pointer" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        <div className="relative">
          <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        {/* USER */}
        <div className="flex items-center gap-2">
          {shopLogo ? (
            <img
              src={shopLogo}
              alt="logo cửa hàng"
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold">
              {initials}
            </div>
          )}
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-800 leading-tight">
              {displayName}
            </div>
            <div className="text-xs text-gray-400 leading-tight">Nhà bán hàng</div>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className="p-1.5 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
