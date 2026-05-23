import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import productApi from "../../api/productApi";

const QUICK_PROMPTS = [
  "Ghế nào ngồi lâu không đau lưng?",
  "Có bàn nâng hạ dưới 5 triệu không?",
  "So sánh 2 ghế này",
  "Sản phẩm nào bán chạy?",
];

const GUEST_STORAGE_KEY = "ai_chat_guest_history";

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function AIChatbox() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isAuthed, setIsAuthed] = useState(
    Boolean(localStorage.getItem("token")),
  );

  const listRef = useRef(null);
  const lastAuthedRef = useRef(isAuthed);

  const setGreeting = () =>
    setMessages([
      {
        role: "assistant",
        text: "Chào bạn! Mình là AI tư vấn nội thất. Bạn cần hỗ trợ gì?",
      },
    ]);

  const loadAuthedHistory = async () => {
    try {
      const response = await productApi.aiHistory();
      const histories = Array.isArray(response?.data) ? response.data : [];

      if (histories.length === 0) {
        setGreeting();
        return;
      }

      const mapped = histories.flatMap((item) => [
        { role: "user", text: item.question || "" },
        {
          role: "assistant",
          text: item.answer || "",
          products: Array.isArray(item.products)
            ? item.products.map((product) => ({
              id: product.product_id,
              name: product.name,
              price: product.price,
              rating_average: product.rating_average,
              sold: product.sold,
              category: product.category,
            }))
            : [],
        },
      ]);

      setMessages(mapped);
    } catch (error) {
      setGreeting();
    }
  };

  useEffect(() => {
    const syncAuth = () => {
      setIsAuthed(Boolean(localStorage.getItem("token")));
    };

    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-change", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-change", syncAuth);
    };
  }, []);

  useEffect(() => {
    if (isAuthed) {
      loadAuthedHistory();
      return;
    }

    try {
      const raw = localStorage.getItem(GUEST_STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw);
        if (Array.isArray(stored) && stored.length > 0) {
          setMessages(stored);
          return;
        }
      }
    } catch (error) {
      // ignore storage errors
    }

    setGreeting();
  }, [isAuthed]);

  useEffect(() => {
    if (lastAuthedRef.current && !isAuthed) {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      setGreeting();
    }
    lastAuthedRef.current = isAuthed;
  }, [isAuthed]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (isAuthed) return;
    try {
      if (messages.length === 0) return;
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      // ignore storage errors
    }
  }, [messages, isAuthed]);

  const suggestions = useMemo(() => QUICK_PROMPTS, []);

  const pushMessage = (message) =>
    setMessages((prev) => [...prev, message]);

  const handleSend = async (customText) => {
    const text = String(customText ?? input).trim();
    if (!text || loading) return;

    setInput("");
    pushMessage({ role: "user", text });

    setLoading(true);
    try {
      const response = await productApi.aiChat({ message: text });
      const reply = response?.data?.reply || "Hiện chưa có thông tin phù hợp.";
      const products = response?.data?.products || [];

      pushMessage({ role: "assistant", text: reply, products });
    } catch (error) {
      pushMessage({
        role: "assistant",
        text: "Xin lỗi, hệ thống đang bận. Bạn vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-display">
      {open && (
        <div className="mb-4 w-[340px] rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.6)]">
          <div className="flex items-center justify-between rounded-t-3xl border-b border-slate-100 bg-slate-900 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">AI Tư Vấn Nội Thất</p>
              <p className="text-xs text-slate-300">Trả lời dựa trên dữ liệu sản phẩm</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium transition hover:bg-white/20"
            >
              Đóng
            </button>
          </div>

          <div className="max-h-[360px] space-y-4 overflow-y-auto px-4 py-4" ref={listRef}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${message.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700"
                    }`}
                >
                  <p>{message.text}</p>
                  {Array.isArray(message.products) && message.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.products.slice(0, 4).map((item) => {
                        const productId = item.product_id || item.id;
                        if (!productId) return null;

                        return (
                          <Link
                            key={productId}
                            to={`/san-pham/${productId}`}
                            className="block rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700 transition hover:border-slate-200 hover:bg-white"
                          >
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <p className="text-slate-600">{formatPrice(item.price)}</p>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-4 py-2 text-xs text-slate-500 shadow-sm">
                  Đang trả lời...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 pb-4">
            <div className="flex flex-wrap gap-2 pt-3">
              {suggestions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSend();
                }}
                placeholder="Nhập câu hỏi về sản phẩm..."
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={loading}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg transition hover:-translate-y-1 hover:bg-slate-800"
      >
        {open ? "--" : "AI"}
      </button>
    </div>
  );
}
