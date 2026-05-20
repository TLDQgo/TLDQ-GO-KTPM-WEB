import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingBag, AlertTriangle, Layers, TrendingUp, Plus, Settings } from "lucide-react";
import productApi from "../../api/productApi";
import orderApi from "../../api/orderApi";
import useAuthStore from "../../store/useAuthStore";

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        {loading ? (
          <div className="mt-1 h-7 w-16 rounded bg-gray-200 animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        )}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-t animate-pulse">
      <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0"/><div className="h-4 bg-gray-200 rounded w-32"/></div></td>
      <td className="px-4 py-3 text-center"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"/></td>
      <td className="px-4 py-3 text-center"><div className="h-4 bg-gray-200 rounded w-12 mx-auto"/></td>
      <td className="px-4 py-3 text-center"><div className="h-4 bg-gray-200 rounded w-24 mx-auto"/></td>
    </tr>
  );
}

export default function HomeSeller() {
  const user = useAuthStore((s) => s.user);
  const sellerId = user?._id;

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      if (!sellerId) return;
      setLoading(true);
      try {
        const firstPage = await productApi.getProductsBySeller(sellerId, 1);
        const totalPages = Math.max(firstPage?.pagination?.totalPages || 1, 1);
        const allProducts = [...(firstPage?.data || [])];

        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              productApi.getProductsBySeller(sellerId, i + 2)
            )
          );
          rest.forEach((res) => {
            if (Array.isArray(res?.data)) allProducts.push(...res.data);
          });
        }
        setProducts(allProducts);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [sellerId]);

  useEffect(() => {
    if (!sellerId) return;
    orderApi.getOrdersBySeller(sellerId)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setOrders(Array.isArray(list) ? list : []);
      })
      .catch(() => setOrders([]));
  }, [sellerId]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const soldProducts = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) =>
        sum + (Array.isArray(o.items)
          ? o.items.reduce((s, item) => s + (Number(item.quantity) || 0), 0)
          : 0), 0);
    const outOfStockProducts = products.filter((p) => Number(p.stock_quantity) <= 0).length;
    const totalStockQuantity = products.reduce((sum, p) => sum + (Number(p.stock_quantity) || 0), 0);
    const inventoryValue = products.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock_quantity) || 0), 0
    );
    return { totalProducts, soldProducts, outOfStockProducts, totalStockQuantity, inventoryValue };
  }, [products, orders]);

  const recentProducts = useMemo(() =>
    [...products]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6),
    [products]
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Tổng quan Shop</h1>
        <p className="text-sm text-gray-500 mt-0.5">Thống kê toàn bộ hoạt động kinh doanh của bạn</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Package}       label="Tổng sản phẩm"  value={stats.totalProducts}      color="bg-blue-500"   loading={loading} />
        <StatCard icon={ShoppingBag}   label="Đã bán"         value={stats.soldProducts}       color="bg-green-500"  loading={loading} />
        <StatCard icon={AlertTriangle} label="Hết hàng"       value={stats.outOfStockProducts} color="bg-red-500"    loading={loading} />
        <StatCard icon={Layers}        label="Tổng tồn kho"   value={stats.totalStockQuantity} color="bg-indigo-500" loading={loading} />
      </div>

      {/* Inventory Value */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Giá trị tồn kho ước tính</p>
          {loading ? (
            <div className="mt-1 h-7 w-36 rounded bg-gray-200 animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-emerald-600">
              {stats.inventoryValue.toLocaleString("vi-VN")}đ
            </p>
          )}
        </div>
      </div>

      {/* Recent Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Sản phẩm mới nhất</h2>
          <Link to="/seller/quan-ly-san-pham" className="text-xs text-blue-500 hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Giá</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Tồn kho</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Danh mục</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : recentProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">
                  Chưa có sản phẩm nào
                </td>
              </tr>
            ) : (
              recentProducts.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                      )}
                      <span className="font-medium text-gray-800 line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-red-500">
                    {Number(p.price || 0).toLocaleString("vi-VN")}đ
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{p.stock_quantity || 0}</td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {p.category_id?.name || <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Thao tác nhanh</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/seller/them-san-pham"
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
          >
            <Plus size={16} /> Thêm sản phẩm
          </Link>
          <Link
            to="/seller/quan-ly-san-pham"
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            <Settings size={16} /> Quản lý sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}
