import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, ClipboardList } from "lucide-react";
import cartApi from "../../api/cartApi";

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
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

        {/* MENU */}
        <nav className="hidden md:flex gap-8 text-gray-700 items-center">
          <Link to="/" className="hover:text-blue-600">
            Trang Chủ
          </Link>
          <a href="#" className="hover:text-blue-600">
            Giới Thiệu
          </a>
          <a href="#" className="hover:text-blue-600">
            Sản Phẩm
          </a>
          <a href="#" className="hover:text-blue-600">
            Liên Hệ
          </a>
          <a href="#" className="hover:text-blue-600">
            Tin Tức
          </a>
        </nav>

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
