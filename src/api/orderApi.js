import axiosClient from "./axiosClient";

const orderApi = {
  // Lấy orders của một seller.
  // Thử gọi route mới trước, nếu 404 (server chưa deploy), fallback lấy tất cả rồi lọc client-side.
  getOrdersBySeller: async (sellerId) => {
    try {
      return await axiosClient.get(`orders/seller/${sellerId}`);
    } catch (err) {
      if (err?.response?.status === 404) {
        // axiosClient unwraps response.data nên allOrders là mảng hoặc object trực tiếp
        const allOrders = await axiosClient.get("orders");
        const list = Array.isArray(allOrders) ? allOrders : (allOrders?.data ?? []);
        const filtered = list.filter(
          (o) => String(o.seller_id) === String(sellerId)
        );
        return { success: true, data: filtered };
      }
      throw err;
    }
  },

  updateOrderStatus: (orderId, status) => {
    return axiosClient.put(`orders/${orderId}/status`, { status });
  },
};

export default orderApi;
