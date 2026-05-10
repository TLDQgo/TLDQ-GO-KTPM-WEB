import { create } from "zustand";

const useOrderStore = create((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  updateOrderStatusLocally: (orderId, newStatus) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      ),
    })),
}));

export default useOrderStore;
