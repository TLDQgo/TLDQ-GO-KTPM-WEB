import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function FlashSaleCountdown({ endTime, className = "" }) {
  const calcRemaining = () => {
    const diff = new Date(endTime) - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    return { h, m, s };
  };

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    if (!remaining) return;
    const timer = setInterval(() => {
      const next = calcRemaining();
      setRemaining(next);
      if (!next) clearInterval(timer);
    }, 1_000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (!remaining) {
    return (
      <span className={`text-xs text-gray-400 ${className}`}>Đã kết thúc</span>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Zap className="w-4 h-4 text-yellow-500 fill-yellow-400" />
      <span className="text-sm font-semibold text-red-600">Kết thúc sau:</span>
      <div className="flex items-center gap-1">
        {[pad(remaining.h), pad(remaining.m), pad(remaining.s)].map((unit, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              {unit}
            </span>
            {i < 2 && <span className="text-red-500 font-bold text-xs">:</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
