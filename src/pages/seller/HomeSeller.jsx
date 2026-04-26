import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import productApi from "../../api/productApi";
import orderApi from "../../api/orderApi";
import useAuthStore from "../../store/useAuthStore";

export default function HomeSeller() {
  const user = useAuthStore((s) => s.user);
  const sellerId = user?._id;

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSellerProducts = async () => {
      if (!sellerId) {
        setProducts([]);
        return;
      }

      setLoading(true);
      try {
        const firstPage = await productApi.getProductsBySeller(sellerId, 1);
        const totalPages = Math.max(firstPage?.pagination?.totalPages || 1, 1);
        const allProducts = [...(firstPage?.data || [])];

        if (totalPages > 1) {
          const remainingRequests = [];
          for (let page = 2; page <= totalPages; page += 1) {
            remainingRequests.push(productApi.getProductsBySeller(sellerId, page));
          }

          const remainingResults = await Promise.all(remainingRequests);
          remainingResults.forEach((res) => {
            if (Array.isArray(res?.data)) {
              allProducts.push(...res.data);
            }
          });
        }

        setProducts(allProducts);
      } catch (error) {
        console.error("Lỗi load thống kê seller:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProducts();
  }, [sellerId]);

  useEffect(() => {
    const fetchSellerOrders = async () => {
      if (!sellerId) {
        setOrders([]);
        return;
      }

      try {
        const res = await orderApi.getOrdersBySeller(sellerId);
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setOrders(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Lỗi load đơn hàng seller:", error);
        setOrders([]);
      }
    };

    fetchSellerOrders();
  }, [sellerId]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const soldProducts = orders
      .filter((order) => order.status === "completed")
      .reduce(
        (sum, order) =>
          sum +
          (Array.isArray(order.items)
            ? order.items.reduce((itemSum, item) => itemSum + (Number(item.quantity) || 0), 0)
            : 0),
        0,
      );
    const inStockProducts = products.filter((p) => Number(p.stock_quantity) > 0).length;
    const outOfStockProducts = totalProducts - inStockProducts;
    const totalStockQuantity = products.reduce(
      (sum, p) => sum + (Number(p.stock_quantity) || 0),
      0,
    );
    const inventoryValue = products.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock_quantity) || 0),
      0,
    );

    return {
      totalProducts,
      soldProducts,
      outOfStockProducts,
      totalStockQuantity,
      inventoryValue,
    };
  }, [products, orders]);

  const recentProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6);
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
        <p className="text-sm text-gray-600 mb-6">
          Thống kê toàn bộ sản phẩm hiện có của shop.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Tổng sản phẩm</h3>
            <p className="text-2xl font-bold text-blue-600">
              {loading ? "..." : stats.totalProducts}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Đã bán</h3>
            <p className="text-2xl font-bold text-green-600">
              {loading ? "..." : stats.soldProducts}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Hết hàng</h3>
            <p className="text-2xl font-bold text-red-600">
              {loading ? "..." : stats.outOfStockProducts}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Tổng tồn kho</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {loading ? "..." : stats.totalStockQuantity}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Giá trị tồn kho ước tính</h2>
          <p className="text-3xl font-bold text-emerald-600">
            {stats.inventoryValue.toLocaleString("vi-VN")}đ
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sản phẩm mới nhất</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Sản phẩm</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Giá</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Số lượng</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Danh mục</th>
                </tr>
              </thead>

              <tbody>
                {!loading && recentProducts.length === 0 && (
                  <tr className="border-t">
                    <td colSpan={4} className="px-4 py-4 text-sm text-gray-500 text-center">
                      Chưa có sản phẩm nào.
                    </td>
                  </tr>
                )}

                {recentProducts.map((product) => (
                  <tr key={product._id} className="border-t">
                    <td className="px-4 py-2 text-sm text-gray-900">{product.name}</td>
                    <td className="px-4 py-2 text-sm text-red-500 font-semibold">
                      {(product.price || 0).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{product.stock_quantity || 0}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {product.category_id?.name || "Chưa phân loại"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/seller/them-san-pham"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center block"
            >
              Thêm sản phẩm mới
            </Link>
            <Link
              to="/seller/quan-ly-san-pham"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center block"
            >
              Quản lý sản phẩm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
