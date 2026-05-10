import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import orderApi from "../../api/orderApi";
import authApi from "../../api/authApi";

const PERIODS = [
  { value: "7days", label: "7 ngày" },
  { value: "30days", label: "30 ngày" },
  { value: "3months", label: "3 tháng" },
  { value: "6months", label: "6 tháng" },
  { value: "year", label: "1 năm" },
];

const STATUS_NAMES = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
};

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];

function formatMoney(val) {
  return Number(val || 0).toLocaleString("vi-VN") + "đ";
}

function SectionTitle({ children }) {
  return <h2 className="text-sm font-semibold text-gray-700 mb-4">{children}</h2>;
}

export default function SystemStats() {
  const [period, setPeriod] = useState("30days");

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["adminStats", period],
    queryFn: () => orderApi.getAdminStats(period),
    staleTime: 60000,
  });

  const { data: usersData } = useQuery({
    queryKey: ["adminUsers", { limit: 1 }],
    queryFn: () => authApi.adminListUsers({ limit: 1 }),
    staleTime: 60000,
  });
  const { data: sellersData } = useQuery({
    queryKey: ["adminUsers", { limit: 1, role: "seller" }],
    queryFn: () => authApi.adminListUsers({ limit: 1, role: "seller" }),
    staleTime: 60000,
  });
  const { data: customersData } = useQuery({
    queryKey: ["adminUsers", { limit: 1, role: "customer" }],
    queryFn: () => authApi.adminListUsers({ limit: 1, role: "customer" }),
    staleTime: 60000,
  });

  const summary = statsData?.summary ?? statsData?.data?.summary ?? {};
  const revenueByDate = statsData?.revenue_by_date ?? statsData?.data?.revenue_by_date ?? [];
  const topProducts = statsData?.top_products ?? statsData?.data?.top_products ?? [];
  const statusDist = statsData?.status_distribution ?? statsData?.data?.status_distribution ?? [];

  const totalUsers = usersData?.pagination?.total ?? usersData?.data?.pagination?.total ?? 0;
  const totalSellers = sellersData?.pagination?.total ?? sellersData?.data?.pagination?.total ?? 0;
  const totalCustomers = customersData?.pagination?.total ?? customersData?.data?.pagination?.total ?? 0;

  const pieData = statusDist.map((item) => ({
    name: STATUS_NAMES[item.status] || item.status,
    value: item.count,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Thống kê hệ thống</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-gray-400 py-16 text-center">Đang tải dữ liệu...</div>
      ) : (
        <div className="space-y-6">
          {/* User summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Tổng người dùng", value: totalUsers, color: "bg-indigo-50 text-indigo-700" },
              { label: "Nhà bán hàng", value: totalSellers, color: "bg-orange-50 text-orange-700" },
              { label: "Khách hàng", value: totalCustomers, color: "bg-blue-50 text-blue-700" },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl p-4 ${item.color}`}>
                <p className="text-xs font-medium opacity-70 uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-2xl font-bold">{item.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Tổng đơn hàng", value: summary.total_orders ?? 0, color: "bg-gray-50 text-gray-700" },
              { label: "Doanh thu", value: formatMoney(summary.total_revenue), color: "bg-indigo-50 text-indigo-700" },
              { label: "Hoàn thành", value: summary.completed_orders ?? 0, color: "bg-green-50 text-green-700" },
              { label: "Đã huỷ", value: summary.cancelled_orders ?? 0, color: "bg-red-50 text-red-700" },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl p-4 ${item.color}`}>
                <p className="text-xs font-medium opacity-70 uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-xl font-bold">{typeof item.value === "number" ? item.value.toLocaleString() : item.value}</p>
              </div>
            ))}
          </div>

          {/* Revenue chart */}
          {revenueByDate.length > 0 && (
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <SectionTitle>Doanh thu theo ngày</SectionTitle>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenueByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [formatMoney(v), "Doanh thu"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status distribution pie */}
            {pieData.length > 0 && (
              <div className="bg-white rounded-xl border p-5 shadow-sm">
                <SectionTitle>Phân bố trạng thái đơn hàng</SectionTitle>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Orders per day bar */}
            {revenueByDate.length > 0 && (
              <div className="bg-white rounded-xl border p-5 shadow-sm">
                <SectionTitle>Số đơn hàng hoàn thành theo ngày</SectionTitle>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top products table */}
          {topProducts.length > 0 && (
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <SectionTitle>Top 10 sản phẩm bán chạy nhất</SectionTitle>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 pr-4 font-medium">STT</th>
                      <th className="pb-2 pr-4 font-medium">Sản phẩm</th>
                      <th className="pb-2 pr-4 font-medium text-right">Số lượng</th>
                      <th className="pb-2 font-medium text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={p.product_id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2.5 pr-4 text-gray-400 font-medium">{i + 1}</td>
                        <td className="py-2.5 pr-4 font-medium text-gray-800">
                          {p.product_name || p.product_id}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-gray-600">
                          {(p.total_quantity || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-indigo-600">
                          {formatMoney(p.total_revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
