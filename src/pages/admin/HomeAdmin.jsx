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
import authApi from "../../api/authApi";

const PERIODS = [
  { value: "7days", label: "7 ngày" },
  { value: "30days", label: "30 ngày" },
  { value: "3months", label: "3 tháng" },
  { value: "6months", label: "6 tháng" },
  { value: "year", label: "1 năm" },
];

function formatMoney(val) {
  return Number(val || 0).toLocaleString("vi-VN") + "đ";
}

function StatCard({ label, value, sub, color = "indigo" }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <div className={`rounded-xl p-5 ${colors[color]} flex flex-col gap-1 shadow-sm border border-opacity-10`}>
      <span className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
      {sub && <span className="text-xs opacity-60">{sub}</span>}
    </div>
  );
}

export default function HomeAdmin() {
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

  const stats = statsData?.summary ?? statsData?.data?.summary ?? {};
  const revenueByDate = statsData?.revenue_by_date ?? statsData?.data?.revenue_by_date ?? [];
  const topProducts = statsData?.top_products ?? statsData?.data?.top_products ?? [];
  const totalUsers = usersData?.pagination?.total ?? usersData?.data?.pagination?.total ?? 0;

  return (
    <div className="p-4 sm:p-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Tổng quan hệ thống</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-gray-400 py-12 text-center animate-pulse">Đang tải dữ liệu hệ thống...</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Doanh thu"
              value={formatMoney(stats.total_revenue)}
              color="indigo"
            />
            <StatCard
              label="Tổng đơn hàng"
              value={(stats.total_orders ?? 0).toLocaleString()}
              sub={`Toàn thời gian: ${(stats.total_all_time ?? 0).toLocaleString()}`}
              color="blue"
            />
            <StatCard
              label="Đơn hoàn thành"
              value={(stats.completed_orders ?? 0).toLocaleString()}
              color="green"
            />
            <StatCard
              label="Đơn đã huỷ"
              value={(stats.cancelled_orders ?? 0).toLocaleString()}
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Đơn chờ xử lý"
              value={(stats.pending_orders ?? 0).toLocaleString()}
              color="yellow"
            />
            <StatCard
              label="Người dùng"
              value={totalUsers.toLocaleString()}
              sub="Tổng tài khoản"
              color="indigo"
            />
          </div>

          {/* Revenue chart */}
          {revenueByDate.length > 0 && (
            <div className="bg-white rounded-xl border p-5 mb-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Doanh thu theo ngày (đơn hoàn thành)
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={revenueByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(v) => (v / 1000).toFixed(0) + "k"}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(v) => [formatMoney(v), "Doanh thu"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top products */}
          {topProducts.length > 0 && (
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                Top 10 sản phẩm bán chạy nhất
              </h2>
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
                      <tr key={p.product_id} className="border-b last:border-0 hover:bg-gray-50 transition">
                        <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                        <td className="py-2 pr-4 font-medium text-gray-800">
                          {p.product_name || p.product_id}
                        </td>
                        <td className="py-2 pr-4 text-right text-gray-600">
                          {(p.total_quantity || 0).toLocaleString()}
                        </td>
                        <td className="py-2 text-right font-semibold text-indigo-600">
                          {formatMoney(p.total_revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
