import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, ClipboardList, Search, Bell } from "lucide-react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import cartApi from "../../api/cartApi";
import orderApi from "../../api/orderApi";

const SOCKET_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? import.meta.env.VITE_API_URL || ""
    : "";

const Header = () => {
  const [user, setUser] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = () => {
    const q = keyword.trim();
    if (!q) return;
    navigate(`/tim-kiem?q=${encodeURIComponent(q)}`);
  };

  // Lấy danh sách notifications khi user đăng nhập
  const { data: notifData } = useQuery({
    queryKey: ["notifications", user?._id],
    queryFn: () => orderApi.getNotifications(user._id),
    enabled: !!user?._id,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    const list = notifData?.data ?? notifData;
    if (Array.isArray(list)) setNotifications(list);
  }, [notifData]);

  // Kết nối socket.io khi user đăng nhập
  useEffect(() => {
    if (!user?._id) return;
    const socket = io(SOCKET_URL, {
      query: { userId: user._id },
      transports: ["websocket", "polling"],
    });
    socket.on("notification", (data) => {
      setNotifications((prev) => [{ ...data, _id: Date.now(), read: false }, ...prev]);
      toast.info(data.title, { autoClose: 4000 });
    });
    return () => socket.disconnect();
  }, [user?._id]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (notif) => {
    if (notif.read || !notif._id) return;
    setNotifications((prev) =>
      prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
    );
    try {
      await orderApi.markNotificationRead(notif._id);
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    if (!user?._id) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await orderApi.markAllNotificationsRead(user._id);
    } catch { /* silent */ }
  };
  const { data: cartData } = useQuery({
    queryKey: ["cart", user?._id],
    queryFn: () => cartApi.getCart(user._id),
    enabled: !!user?._id,
    staleTime: 30000,
  });
  const cartCount = (cartData?.data ?? cartData)?.items?.reduce(
    (sum, item) => sum + item.quantity,
    0,
  ) ?? 0;

  const loadUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("auth-change", loadUser);
    return () => window.removeEventListener("auth-change", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };
  const handleSellerClick = () => {
    // if (user?.role === "seller") {
    //   navigate("/seller");
    // } else {
    //   navigate("/register-seller");
    // }
    navigate("/register-seller");
  };
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        {/* LOGO */}
        <Link to="/">
          <div className="text-blue-600 font-bold text-xl">TLDQ-GO</div>
        </Link>

        {/* SEARCH BAR */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="flex w-full border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-400">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 px-4 py-2 text-sm outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-3 bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 items-center">
          {/* CART ICON */}
          <Link
            to="/gio-hang"
            className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] leading-none rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* ORDER HISTORY ICON — chỉ hiện khi đã đăng nhập */}
          {user && (
            <Link
              to="/don-hang"
              title="Đơn hàng của tôi"
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition"
            >
              <ClipboardList className="w-5 h-5" />
            </Link>
          )}

          {/* NOTIFICATION BELL — chỉ hiện khi đã đăng nhập */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotif((v) => !v)}
                className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] leading-none rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 top-12 w-80 bg-white border rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <span className="font-semibold text-sm text-gray-800">Thông báo</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-sm text-gray-400 py-8">Chưa có thông báo</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkRead(n)}
                          className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition ${
                            !n.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <p className={`text-sm font-medium ${!n.read ? "text-blue-800" : "text-gray-800"}`}>
                            {n.title}
                          </p>
                          {n.message && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {n.createdAt ? new Date(n.createdAt).toLocaleString("vi-VN") : ""}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSellerClick}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Nhà Bán hàng
          </button>
          {user ? (
            <>
              {/* USER */}
              <Link
                to="/profile"
                className="font-semibold text-gray-700 hover:text-blue-600 transition flex items-center gap-2"
              >
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                Chào, {user.full_name || user.email}
              </Link>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="border px-4 py-2 rounded-lg text-red-600 border-red-600 hover:bg-red-50 transition"
              >
                Đăng Xuất
              </button>
            </>
          ) : (
            <>
              {/* LOGIN BUTTON */}
              <Link to="/login">
                <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                  Đăng Nhập
                </button>
              </Link>

              {/* REGISTER */}
              <Link to="/register">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Đăng Ký
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
