import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { TrendingUp, ShoppingBag, CheckCircle, XCircle, Download, BarChart3 } from "lucide-react";
import orderApi from "../../api/orderApi";
import useAuthStore from "../../store/useAuthStore";

const PERIODS = [
  { label: "7 ngày",   value: "7days"   },
  { label: "30 ngày",  value: "30days"  },
  { label: "3 tháng",  value: "3months" },
  { label: "6 tháng",  value: "6months" },
  { label: "Năm nay",  value: "year"    },
];

const STATUS_VI = {
  pending:          { label: "Chờ xác nhận",   cls: "bg-yellow-100 text-yellow-700" },
  confirmed:        { label: "Đã xác nhận",     cls: "bg-blue-100 text-blue-700"    },
  preparing:        { label: "Đang đóng gói",   cls: "bg-indigo-100 text-indigo-700"},
  delivering:       { label: "Đang giao hàng",  cls: "bg-purple-100 text-purple-700"},
  completed:        { label: "Hoàn thành",      cls: "bg-green-100 text-green-700"  },
  cancelled:        { label: "Đã huỷ",          cls: "bg-red-100 text-red-600"      },
  awaiting_payment: { label: "Chờ thanh toán",  cls: "bg-orange-100 text-orange-700"},
};

const BAR_COLORS = {
  completed:  "bg-green-400",
  cancelled:  "bg-red-400",
  delivering: "bg-purple-400",
  preparing:  "bg-indigo-400",
  confirmed:  "bg-blue-400",
  pending:    "bg-yellow-400",
  awaiting_payment: "bg-orange-400",
};

function formatVND(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")}đ`;
}

function StatCard({ icon: Icon, iconBg, label, value, sub, loading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        {loading ? (
          <div className="mt-1.5 h-6 w-28 bg-gray-200 rounded animate-pulse" />
        ) : (
          <p className="text-xl font-bold text-gray-800 mt-0.5 truncate">{value}</p>
        )}
        {sub && !loading && (
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-gray-200 shrink-0" />
      <div className="flex-1">
        <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-6 bg-gray-200 rounded w-32" />
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-gray-500 text-xs mb-1">Ngày: {label}</p>
      <p className="font-bold text-red-600">{formatVND(payload[0]?.value)}</p>
    </div>
  );
};

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

  const summary = data?.summary || {
    total_revenue: 0, total_orders: 0,
    completed_orders: 0, cancelled_orders: 0,
  };
  const revenueByDate = data?.revenue_by_date || [];
  const topProducts   = data?.top_products || [];
  const statusDist    = data?.status_distribution || [];

  const totalStatusCount = statusDist.reduce((s, d) => s + (d.count || 0), 0);
  const completionRate = summary.total_orders > 0
    ? Math.round((summary.completed_orders / summary.total_orders) * 100)
    : 0;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(revenueByDate.map((r) => ({ Ngày: r.date, "Doanh thu (đ)": r.revenue }))),
      "Doanh thu theo ngày"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(topProducts.map((p, i) => ({
        "#": i + 1, "Sản phẩm": p.product_name,
        "Số lượng bán": p.total_quantity, "Doanh thu (đ)": p.total_revenue,
      }))),
      "Top sản phẩm"
    );
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `doanh-thu-${period}-${Date.now()}.xlsx`);
  };

  if (!sellerId)
    return (
      <div className="p-8 text-center text-orange-500 font-semibold">
        Bạn chưa đăng nhập. Vui lòng{" "}
        <a href="/login-seller" className="underline text-blue-600">đăng nhập Seller</a>{" "}
        để xem thống kê.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Thống kê Doanh thu</h1>
          <p className="text-sm text-gray-500 mt-0.5">Theo dõi hiệu quả kinh doanh của shop</p>
        </div>
        {!isLoading && !isError && (
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition"
          >
            <Download size={15} /> Xuất Excel
          </button>
        )}
      </div>

      {/* Period selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === p.value
                ? "bg-red-500 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {isError && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-red-500 text-sm mb-6">
          Lỗi: {error?.response?.data?.message || error?.message || "Không thể tải dữ liệu"}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              icon={TrendingUp} iconBg="bg-emerald-500"
              label="Doanh thu (hoàn thành)"
              value={formatVND(summary.total_revenue)}
              loading={false}
            />
            <StatCard
              icon={ShoppingBag} iconBg="bg-blue-500"
              label="Tổng đơn hàng"
              value={summary.total_orders}
              sub={`Tỉ lệ thành công: ${completionRate}%`}
              loading={false}
            />
            <StatCard
              icon={CheckCircle} iconBg="bg-green-500"
              label="Đơn hoàn thành"
              value={summary.completed_orders}
              loading={false}
            />
            <StatCard
              icon={XCircle} iconBg="bg-red-500"
              label="Đơn đã huỷ"
              value={summary.cancelled_orders}
              loading={false}
            />
          </>
        )}
      </div>

      {!isLoading && !isError && (
        <>
          {/* Area Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-5 h-5 text-red-500" />
              <h2 className="text-sm font-semibold text-gray-700">Doanh thu theo ngày (đơn hoàn thành)</h2>
            </div>
            {revenueByDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <BarChart3 className="w-12 h-12 mb-2" />
                <p className="text-sm text-gray-400">Chưa có dữ liệu cho kỳ này</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueByDate} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickFormatter={(val) => val.slice(5)}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickFormatter={(val) =>
                      val >= 1_000_000 ? `${(val / 1_000_000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}k`
                    }
                    axisLine={false} tickLine={false} width={48}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#ef4444", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 2-col: Top Products + Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Top Products — chiếm 3/5 */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Top 10 sản phẩm bán chạy</h2>
              </div>
              {topProducts.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">Chưa có sản phẩm nào được bán</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Sản phẩm</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">SL</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topProducts.map((product, idx) => {
                      const medals = ["🥇", "🥈", "🥉"];
                      return (
                        <tr key={product.product_id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-center">
                            {idx < 3 ? (
                              <span className="text-base">{medals[idx]}</span>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium">{idx + 1}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-800 font-medium max-w-[180px]">
                            <span className="line-clamp-2">{product.product_name}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">{product.total_quantity}</td>
                          <td className="px-4 py-3 text-right font-semibold text-red-600">
                            {formatVND(product.total_revenue)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Status Distribution — chiếm 2/5 */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Phân bổ trạng thái</h2>
              {statusDist.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Chưa có đơn hàng nào</p>
              ) : (
                <div className="space-y-3">
                  {statusDist.map((s) => {
                    const pct = totalStatusCount > 0 ? Math.round((s.count / totalStatusCount) * 100) : 0;
                    const info = STATUS_VI[s.status] || { label: s.status, cls: "bg-gray-100 text-gray-600" };
                    const bar  = BAR_COLORS[s.status] || "bg-gray-300";
                    return (
                      <div key={s.status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${info.cls}`}>
                            {info.label}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">
                            {s.count} <span className="text-gray-300">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${bar}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
