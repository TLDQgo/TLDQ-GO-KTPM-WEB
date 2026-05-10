import { create } from "zustand";

const useUserStore = create((set) => ({
  user: JSON.parse(sessionStorage.getItem("user")) || null, // Lấy user từ sessionStorage
  token: sessionStorage.getItem("token") || null, // Lấy token từ sessionStorage

  // setUser: (user) => {
  //     set({ user });
  //     sessionStorage.setItem('user', JSON.stringify(user)); // Lưu user vào sessionStorage
  // },
  setUser: (newUser) => {
    set((state) => {
      const mergedUser = {
        ...state.user,
        ...newUser,
        ...(state.user?.role === "applicant" && {
          userDetails: {
            ...state.user?.userDetails,
            ...newUser?.userDetails,
          },
        }),
        ...(state.user?.role === "employer" && {
          employerDetails: {
            ...state.user?.employerDetails,
            ...newUser?.employerDetails,
          },
        }),
      };
      sessionStorage.setItem("user", JSON.stringify(mergedUser));
      return { user: mergedUser };
    });
  },

  setToken: (token) => {
    set({ token });
    sessionStorage.setItem("token", token); // Lưu token vào sessionStorage
  },

  logout: () => {
    set({ user: null, token: null });
    sessionStorage.removeItem("user"); // Xóa user khỏi sessionStorage
    sessionStorage.removeItem("token"); // Xóa token khỏi sessionStorage
  },
}));

export default useUserStore;
