"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface ReportLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportLookupModal({ isOpen, onClose }: ReportLookupModalProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/[^0-9]/g, "");
    if (!/^01[016789]\d{7,8}$/.test(digits)) {
      setError("결제 시 입력한 휴대폰 번호를 정확히 입력해주세요.");
      return;
    }
    if (!/^\d{4}$/.test(pin.trim())) {
      setError("문자로 받은 숫자 4자리 열람 PIN을 입력해주세요.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/report/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits, pin: pin.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.analysisId) {
        throw new Error(data.error || "일치하는 리포트를 찾을 수 없습니다.");
      }
      onClose();
      router.push(`/result/${data.analysisId}`);
    } catch (err: any) {
      setError(err.message || "조회 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl z-10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[17px] font-black text-zinc-900">
              결제한 리포트 · 상담 이어하기
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-[12.5px] text-zinc-500 leading-relaxed mb-4">
            결제 시 입력한 <strong>휴대폰 번호</strong>와 문자로 발송된 <strong>열람 PIN 4자리</strong>를 입력하면 리포트와 1:1 AI 상담을 바로 이어서 보실 수 있습니다.
          </p>

          <form onSubmit={handleLookup} className="space-y-3">
            <div>
              <label className="block text-[12px] font-bold text-zinc-700 mb-1">휴대폰 번호</label>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="010-1234-5678"
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-[14px] text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-zinc-700 mb-1">열람 PIN (4자리)</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/[^0-9]/g, ""));
                  if (error) setError(null);
                }}
                placeholder="숫자 4자리"
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-[14px] tracking-[0.25em] font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition"
              />
            </div>

            {error && (
              <p className="text-[12px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-zinc-900 text-white text-[14px] font-bold rounded-xl hover:bg-zinc-800 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "조회 중..." : "내 리포트 & 상담실 열기"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
