import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import authApi from "../../api/authApi";

const STATUS_LABEL = {
  pending: { text: "Chờ duyệt", cls: "bg-orange-100 text-orange-700" },
  rejected: { text: "Đã từ chối", cls: "bg-red-100 text-red-700" },
};

export default function SellerRequests() {
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  const [rejectModal, setRejectModal] = useState(null); // { id, name }
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function fetchData(page = 1) {
    setLoading(true);
    try {
      const res = await authApi.adminListSellerRequests({ status, page, limit: 10 });
      setItems(res.items || []);
      setPagination(res.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch {
      toast.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(1); }, [status]);

  async function handleApprove(id) {
    setActionLoading(true);
    try {
      await authApi.adminApproveSellerUpgrade(id);
      toast.success("Đã phê duyệt thành công");
      fetchData(pagination.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Phê duyệt thất bại");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectConfirm() {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      await authApi.adminRejectSellerUpgrade(rejectModal.id, { reason: rejectReason.trim() || undefined });
      toast.success("Đã từ chối yêu cầu");
      setRejectModal(null);
      setRejectReason("");
      fetchData(pagination.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Từ chối thất bại");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Yêu cầu nâng cấp Seller</h1>
        <div className="flex gap-2">
          {["pending", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                status === s
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s === "pending" ? "Chờ duyệt" : "Đã từ chối"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-16">Không có yêu cầu nào</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Người dùng</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Tên shop</th>
                <th className="px-4 py-3 text-left">Thời gian gửi</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                {status === "pending" && <th className="px-4 py-3 text-left">Hành động</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((u) => {
                const badge = STATUS_LABEL[u.seller_upgrade_status] || STATUS_LABEL.pending;
                return (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.full_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-700">{u.seller_upgrade_shop_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {u.seller_upgrade_requested_at
                        ? new Date(u.seller_upgrade_requested_at).toLocaleString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${badge.cls}`}>
                        {badge.text}
                      </span>
                      {u.seller_upgrade_status === "rejected" && u.seller_upgrade_reject_reason && (
                        <p className="text-xs text-red-400 mt-0.5">{u.seller_upgrade_reject_reason}</p>
                      )}
                    </td>
                    {status === "pending" && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(u._id)}
                            disabled={actionLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg transition disabled:opacity-50"
                          >
                            <CheckCircle size={13} />
                            Duyệt
                          </button>
                          <button
                            onClick={() => { setRejectModal({ id: u._id, name: u.full_name }); setRejectReason(""); }}
                            disabled={actionLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            Từ chối
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchData(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                p === pagination.page
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-base font-bold text-gray-800 mb-1">Từ chối yêu cầu</h3>
            <p className="text-sm text-gray-500 mb-4">
              Từ chối yêu cầu nâng cấp của <span className="font-semibold">{rejectModal.name}</span>
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Lý do từ chối (không bắt buộc)"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-300 resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-sm bg-red-500 hover:bg-red-600 text-white font-semibold transition disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
