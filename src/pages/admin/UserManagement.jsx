import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Search, UserCheck, UserX, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import authApi from "../../api/authApi";

const ROLE_LABELS = { customer: "Khách hàng", seller: "Nhà bán", admin: "Admin" };
const ROLE_COLORS = {
  customer: "bg-blue-100 text-blue-700",
  seller: "bg-orange-100 text-orange-700",
  admin: "bg-purple-100 text-purple-700",
};
const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",
  blocked: "bg-red-100 text-red-700",
  inactive: "bg-gray-100 text-gray-600",
};

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["adminUsers", { page, keyword, role: roleFilter, status: statusFilter }],
    queryFn: () =>
      authApi.adminListUsers({
        page,
        limit: 15,
        keyword: keyword || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      }),
    keepPreviousData: true,
    staleTime: 30000,
  });

  const users = data?.items ?? data?.data?.items ?? [];
  const pagination = data?.pagination ?? data?.data?.pagination ?? {};

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => authApi.adminUpdateUser(id, payload),
    onSuccess: (_, { payload }) => {
      const action = payload.status === "blocked" ? "Đã khoá" : "Đã mở khoá";
      toast.success(`${action} tài khoản thành công`);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Thao tác thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => authApi.adminDeleteUser(id),
    onSuccess: () => {
      toast.success("Đã xóa tài khoản");
      setConfirmDelete(null);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Xóa thất bại"),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput);
    setPage(1);
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === "blocked" ? "active" : "blocked";
    updateMutation.mutate({ id: user._id, payload: { status: newStatus } });
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Quản lý người dùng</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-4 shadow-sm flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
          >
            Tìm
          </button>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option value="">Tất cả vai trò</option>
          <option value="customer">Khách hàng</option>
          <option value="seller">Nhà bán</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="blocked">Đã khoá</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Không tìm thấy người dùng nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Người dùng</th>
                  <th className="px-4 py-3 font-medium">Vai trò</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Ngày tạo</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const initial = (user.full_name || user.email || "?")[0].toUpperCase();
                  const createdAt = user.created_at
                    ? new Date(user.created_at).toLocaleDateString("vi-VN")
                    : "—";
                  return (
                    <tr key={user._id} className="border-b last:border-0 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-xs shrink-0">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              initial
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 leading-tight">
                              {user.full_name || "—"}
                            </p>
                            <p className="text-gray-400 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[user.role] || "bg-gray-100 text-gray-600"}`}>
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[user.status] || "bg-gray-100 text-gray-600"}`}>
                          {user.status === "blocked" ? "Đã khoá" : user.status === "active" ? "Hoạt động" : user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{createdAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={updateMutation.isPending}
                            title={user.status === "blocked" ? "Mở khoá" : "Khoá tài khoản"}
                            className={`p-1.5 rounded-lg transition ${
                              user.status === "blocked"
                                ? "text-green-600 hover:bg-green-50"
                                : "text-yellow-600 hover:bg-yellow-50"
                            }`}
                          >
                            {user.status === "blocked" ? <UserCheck size={16} /> : <UserX size={16} />}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(user)}
                            title="Xoá tài khoản"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-sm">
            <span className="text-gray-500">
              Trang {pagination.page} / {pagination.totalPages} — {pagination.total} người dùng
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border hover:bg-white disabled:opacity-40 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-1.5 rounded-lg border hover:bg-white disabled:opacity-40 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xoá</h3>
            <p className="text-gray-600 text-sm mb-4">
              Bạn có chắc muốn xoá tài khoản{" "}
              <strong>{confirmDelete.full_name || confirmDelete.email}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm"
              >
                Huỷ
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDelete._id)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition text-sm font-semibold"
              >
                {deleteMutation.isPending ? "Đang xoá..." : "Xoá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
