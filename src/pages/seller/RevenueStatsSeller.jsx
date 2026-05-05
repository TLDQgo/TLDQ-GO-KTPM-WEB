import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import orderApi from "../../api/orderApi";
import useAuthStore from "../../store/useAuthStore";

const PERIODS = [
  { label: "7 ngày", value: "7days" },
  { label: "30 ngày", value: "30days" },
  { label: "3 tháng", value: "3months" },
  { label: "6 tháng", value: "6months" },
  { label: "Năm nay", value: "year" },
];

const STATUS_VI = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang đóng gói",
  delivering: "Đang giao hàng",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
};

function formatVND(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")}đ`;
}

function SummaryCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function RevenueStatsSeller() {
  const user = useAuthStore((s) => s.user);
  const sellerId = user?.role === "seller" ? user._id : null;

  const [period, setPeriod] = useState("30days");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["sellerStats", sellerId, period],
    queryFn: () => orderApi.getSellerStats(sellerId, period),
    enabled: !!sellerId,
    staleTime: 5 * 60 * 1000,
  });

  // axiosClient unwrap response.data nên data là thẳng JSON body
  const summary = data?.summary || {
    total_revenue: 0,
    total_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    pending_orders: 0,
  };
  const revenueByDate = data?.revenue_by_date || [];
  const topProducts = data?.top_products || [];
  const statusDist = data?.status_distribution || [];

  if (!sellerId) {
    return (
      <div className="p-8 text-center text-orange-500 font-semibold">
        Bạn chưa đăng nhập. Vui lòng{" "}
        <a href="/login-seller" className="underline text-blue-600">
          đăng nhập Seller
        </a>{" "}
        để xem thống kê.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Thống kê Doanh thu
        </h1>

        {/* Bộ lọc khoảng thời gian */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${period === p.value
                  ? "bg-red-500 text-white shadow"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-16 text-gray-500">
            Đang tải dữ liệu...
          </div>
        )}

        {isError && (
          <div className="text-center py-16 text-red-500">
            Lỗi: {error?.response?.data?.message || error?.message || "Không thể tải dữ liệu"}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* 4 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SummaryCard
                title="Doanh thu (đơn hoàn thành)"
                value={formatVND(summary.total_revenue)}
                color="text-emerald-600"
              />
              <SummaryCard
                title="Tổng đơn hàng"
                value={summary.total_orders}
                color="text-blue-600"
              />
              <SummaryCard
                title="Hoàn thành"
                value={summary.completed_orders}
                color="text-green-600"
              />
              <SummaryCard
                title="Đã huỷ"
                value={summary.cancelled_orders}
                color="text-red-600"
              />
            </div>

            {/* Biểu đồ doanh thu theo ngày */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Doanh thu theo ngày (đơn hoàn thành)
              </h2>
              {revenueByDate.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-10">
                  Chưa có dữ liệu cho kỳ này
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={revenueByDate}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) => val.slice(5)}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) =>
                        val >= 1_000_000
                          ? `${(val / 1_000_000).toFixed(1)}M`
                          : `${(val / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      formatter={(value) => [formatVND(value), "Doanh thu"]}
                      labelFormatter={(label) => `Ngày: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Bảng top 10 sản phẩm bán chạy */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Top 10 sản phẩm bán chạy
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase">
                      <th className="p-3 font-semibold">#</th>
                      <th className="p-3 font-semibold">Sản phẩm</th>
                      <th className="p-3 font-semibold text-right">Số lượng</th>
                      <th className="p-3 font-semibold text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-6 text-center text-gray-400"
                        >
                          Chưa có sản phẩm nào được bán
                        </td>
                      </tr>
                    ) : (
                      topProducts.map((product, idx) => (
                        <tr key={product.product_id} className="hover:bg-gray-50">
                          <td className="p-3 text-gray-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="p-3 text-gray-800 font-medium">
                            {product.product_name}
                          </td>
                          <td className="p-3 text-right text-gray-700">
                            {product.total_quantity}
                          </td>
                          <td className="p-3 text-right font-semibold text-red-600">
                            {formatVND(product.total_revenue)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phân bổ trạng thái đơn hàng */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Phân bổ trạng thái đơn hàng
              </h2>
              {statusDist.length === 0 ? (
                <p className="text-gray-400 text-sm">Chưa có đơn hàng nào</p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {statusDist.map((s) => (
                    <div
                      key={s.status}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-5 py-3 text-center min-w-[130px]"
                    >
                      <p className="text-xs text-gray-500 mb-1">
                        {STATUS_VI[s.status] || s.status}
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {s.count}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
