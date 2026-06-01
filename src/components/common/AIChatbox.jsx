import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import productApi from "../../api/productApi";

const QUICK_PROMPTS = [
  "Ghế nào ngồi lâu không đau lưng?",
  "Có bàn nâng hạ dưới 5 triệu không?",
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
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [imageMap, setImageMap] = useState({});
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
              image: product.image,
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

  useEffect(() => {
    const idsToFetch = new Set();

    messages.forEach((message) => {
      if (!Array.isArray(message.products)) return;

      message.products.forEach((item) => {
        const productId = item.product_id || item.id;
        if (!productId) return;
        if (item.image) return;
        if (imageMap[productId]) return;
        idsToFetch.add(productId);
      });
    });

    if (idsToFetch.size === 0) return;

    let cancelled = false;

    const fetchImages = async () => {
      const results = await Promise.all(
        Array.from(idsToFetch).map(async (productId) => {
          try {
            const res = await productApi.getById(productId);
            const product = res?.data ?? res;
            const image = Array.isArray(product?.images) && product.images.length > 0
              ? product.images[0]
              : product?.image_url || "";
            return { productId, image };
          } catch (error) {
            return { productId, image: "" };
          }
        }),
      );

      if (cancelled) return;

      setImageMap((prev) => {
        const next = { ...prev };
        results.forEach(({ productId, image }) => {
          if (image && !next[productId]) {
            next[productId] = image;
          }
        });
        return next;
      });
    };

    fetchImages();

    return () => {
      cancelled = true;
    };
  }, [messages, imageMap]);

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

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-display">
      {open && (
        <div className="mb-4 w-[300px] max-w-[calc(100vw-2rem)] sm:w-[320px] md:w-[340px] rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.6)]">
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
                        const imageUrl = item.image || imageMap[productId] || "";

                        return (
                          <Link
                            key={productId}
                            to={`/san-pham/${productId}`}
                            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700 transition hover:border-slate-200 hover:bg-white"
                          >
                            <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-white">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{item.name}</p>
                              <p className="text-slate-600">{formatPrice(item.price)}</p>
                            </div>
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
