"use client";

import { useState, useRef, useEffect } from "react";
import { PRICING } from "@/config/pricing";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export interface ChatMessageItem {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

function formatDisplayMessage(raw: string): string {
  const trimmed = (raw || "").trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      const firstStringVal = Object.values(parsed).find((v) => typeof v === "string") as string | undefined;
      if (firstStringVal) {
        return firstStringVal.replace(/\\n/g, "\n").trim();
      }
    } catch {
      const match = trimmed.match(/:\s*"([\s\S]*)"\s*\}$/);
      if (match?.[1]) {
        return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').trim();
      }
    }
  }
  return trimmed.replace(/\\n/g, "\n");
}

interface PremiumChatSectionProps {
  analysisId: string;
  initialChat?: {
    remaining_turns?: number;
    total_used?: number;
    messages?: ChatMessageItem[];
  };
  targetLabel?: string;
  analysisMode?: "reunion" | "flirting";
  onTopupPay: () => Promise<void> | void;
  isTopupProcessing?: boolean;
}

export function PremiumChatSection({
  analysisId,
  initialChat,
  targetLabel = "상대방",
  analysisMode = "reunion",
  onTopupPay,
  isTopupProcessing = false,
}: PremiumChatSectionProps) {
  const resolveInitialTurns = (chatObj?: PremiumChatSectionProps["initialChat"]) => {
    if (!chatObj || chatObj.remaining_turns === undefined || chatObj.remaining_turns === null) {
      return PRICING.REPORT.initialChatTurns;
    }
    if (
      chatObj.remaining_turns <= 0 &&
      (chatObj.total_used || 0) === 0 &&
      (!chatObj.messages || chatObj.messages.length === 0)
    ) {
      return PRICING.REPORT.initialChatTurns;
    }
    return chatObj.remaining_turns;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialChat?.messages || []);
  const [remainingTurns, setRemainingTurns] = useState<number>(() => resolveInitialTurns(initialChat));
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialChat) {
      setMessages(initialChat.messages || []);
      setRemainingTurns(resolveInitialTurns(initialChat));
    }
  }, [initialChat]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#ai-counseling") {
      setIsOpen(true);
    }
  }, []);

  const suggestedQuestions =
    analysisMode === "flirting"
      ? [
          `${targetLabel}한테 내가 보낼 카톡 멘트 첨삭해줘`,
          `지금 먼저 선톡하면 부담스러워할까?`,
          `이거 진짜 호감 있는 거야 아니면 그냥 예의/어장일까?`,
        ]
      : [
          `${targetLabel}한테 내가 보낼 카톡 멘트 첨삭해줘`,
          `지금 먼저 연락해도 될까, 아니면 며칠 더 기다려야 할까?`,
          `상대가 이렇게 답장하면 재회 가능성이 있는 걸까?`,
        ];

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    if (remainingTurns <= 0) {
      setErrorMsg("남은 질문권이 없습니다. 아래에서 추가 질문권을 충전해 주세요.");
      return;
    }

    setErrorMsg(null);
    setIsSending(true);

    const optimisticUser: ChatMessageItem = {
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setInput("");

    try {
      const res = await fetch(`/api/premium/chat/${analysisId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "NO_TURNS_LEFT") {
          setRemainingTurns(0);
          throw new Error("남은 질문권을 모두 사용했습니다.");
        }
        throw new Error(data.error || "답변 생성에 실패했습니다.");
      }

      setMessages(data.messages || []);
      setRemainingTurns(data.remaining_turns ?? 0);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } catch (err: any) {
      setMessages((prev) => prev.slice(0, -1));
      setInput(trimmed);
      setErrorMsg(err.message || "오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* 우하단 고정 플로팅 하트 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="1:1 AI 속마음 상담실 열기"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-zinc-950 text-white pl-4 pr-4 py-3 shadow-2xl shadow-zinc-950/30 border border-white/10 hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer print:hidden"
        style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </span>
        <div className="text-left leading-tight">
          <span className="block text-[12.5px] font-black">1:1 AI 상담</span>
          <span className="block text-[10.5px] text-rose-300 font-bold">
            질문권 {remainingTurns}회 남음
          </span>
        </div>
      </button>

      {/* 슬라이드업 채팅 모달 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6 bg-black/50 backdrop-blur-xs print:hidden">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
          <section
            id="ai-counseling"
            className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-zinc-200 flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-950 text-white shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    💘 1:1 AI 속마음 상담실
                  </span>
                  <span className="text-[11px] font-bold text-rose-300">
                    남은 질문권 {remainingTurns}회
                  </span>
                </div>
                <h3 className="text-[15px] font-black mt-1">
                  {targetLabel}님 상황 · 보낼 카톡 물어보기
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chat History */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1 bg-zinc-50/50">
              {messages.length === 0 ? (
                <div className="rounded-2xl bg-white border border-zinc-200/80 p-4 text-[13px] text-zinc-600 leading-relaxed shadow-xs">
                  <p className="font-bold text-zinc-900 mb-1">
                    방금 분석된 {targetLabel}님의 대화 맥락을 모두 기억하고 있어요.
                  </p>
                  <p>
                    보내려는 카톡 문장을 붙여넣어 첨삭을 받거나, 아래 예시 질문을 눌러 바로 물어보세요.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[86%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap shadow-xs ${
                        msg.role === "user"
                          ? "bg-zinc-900 text-white rounded-tr-sm font-medium"
                          : "bg-white text-zinc-800 rounded-tl-sm border border-zinc-200"
                      }`}
                    >
                      {formatDisplayMessage(msg.content)}
                    </div>
                  </div>
                ))
              )}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white text-zinc-500 rounded-2xl rounded-tl-sm px-4 py-3 text-[12.5px] flex items-center gap-2 border border-zinc-200">
                    <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                    <span>대화 맥락을 바탕으로 답변을 작성하고 있어요...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Footer Input / Chips / Upsell */}
            <div className="p-4 border-t border-zinc-100 bg-white shrink-0">
              {remainingTurns > 0 && (
                <div className="mb-3">
                  <p className="text-[11px] font-bold text-zinc-400 mb-1.5">✨ 예시 질문 (클릭 시 바로 전송)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isSending}
                        onClick={() => sendMessage(q)}
                        className="text-left text-[11.5px] font-semibold text-zinc-700 bg-zinc-50 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-zinc-200 rounded-full px-2.5 py-1 transition cursor-pointer disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {errorMsg && (
                <p className="mb-2.5 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {errorMsg}
                </p>
              )}

              {remainingTurns > 0 ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(input);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="보낼 카톡 문장이나 궁금한 점을 입력하세요..."
                    disabled={isSending}
                    maxLength={1000}
                    className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-[13px] text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !input.trim()}
                    className="px-4 py-2.5 bg-zinc-900 text-white text-[13px] font-bold rounded-xl hover:bg-zinc-800 transition disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    전송
                  </button>
                </form>
              ) : (
                <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-extrabold text-amber-900">
                      질문권을 모두 사용했어요
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[11px] text-zinc-400 line-through">
                        {PRICING.CHAT_TOPUP.originalPrice.toLocaleString()}원
                      </span>
                      <span className="text-[15px] font-black text-zinc-950">
                        {PRICING.CHAT_TOPUP.salePrice.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                  <ShimmerButton
                    onClick={onTopupPay}
                    disabled={isTopupProcessing}
                    shimmerColor="#ffffff"
                    shimmerSize="0.08em"
                    shimmerDuration="2.5s"
                    background="linear-gradient(135deg, #18181b 0%, #27272a 100%)"
                    borderRadius="12px"
                    className="w-full py-3 text-[13px] font-black shadow-md"
                  >
                    {isTopupProcessing ? (
                      <span>결제창 여는 중...</span>
                    ) : (
                      <span>
                        💬 1:1 질문권 3회 추가 충전 ({PRICING.CHAT_TOPUP.salePrice.toLocaleString()}원)
                      </span>
                    )}
                  </ShimmerButton>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
