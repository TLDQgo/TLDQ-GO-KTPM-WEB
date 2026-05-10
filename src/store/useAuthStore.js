import { create } from "zustand";

/**
 * Auth store - single source of truth cho thông tin user đang đăng nhập.
 * Đọc từ localStorage khi khởi tạo để duy trì session sau refresh.
 */
function loadUserFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

const useAuthStore = create((set) => ({
  user: loadUserFromStorage(),

  setUser: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null });
  },

  // Lấy sellerId an toàn (chỉ trả về nếu đúng role seller)
  getSellerId: () => {
    const state = useAuthStore.getState();
    if (state.user?.role === "seller") return state.user._id;
    return null;
  },
}));

export default useAuthStore;
