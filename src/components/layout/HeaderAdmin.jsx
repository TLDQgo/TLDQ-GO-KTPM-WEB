import React from "react";
import { Bell, LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeaderAdmin() {
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();

  const initials = user?.full_name?.charAt(0).toUpperCase() ?? "A";
  const displayName = user?.full_name || user?.email || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-900 text-white fixed top-0 left-0 right-0 z-50 shadow">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-indigo-500 rounded">
          <ShieldCheck size={18} />
        </div>
        <span className="text-lg font-semibold">Admin Panel</span>
      </div>

      <div className="flex items-center gap-5">
        <Bell className="w-5 h-5 text-gray-300 cursor-pointer hover:text-white" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
            {initials}
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium leading-tight">{displayName}</div>
            <div className="text-xs text-gray-400 leading-tight">Administrator</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-800 transition"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
