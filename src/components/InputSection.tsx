"use client";

import { useState, forwardRef } from "react";
import { motion } from "framer-motion";

interface InputSectionProps {
  onAnalyze: (text: string) => void;
}

const InputSection = forwardRef<HTMLElement, InputSectionProps>(({ onAnalyze }, ref) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [isModelInfoOpen, setIsModelInfoOpen] = useState(false);
  const [text, setText] = useState("");

  const guideContents = [
    {
      title: "1. 카카오톡 대화방 열기",
      desc: "분석하고 싶은 상대방과의 카카오톡 채팅방에 들어갑니다.",
    },
    {
      title: "2. 대화 내보내기",
      desc: "우측 상단 햄버거 메뉴(≡) > 하단 톱니바퀴(설정) > '대화 내용 내보내기' > '텍스트만 보내기'를 선택합니다.",
    },
    {
      title: "3. 텍스트 복사하기",
      desc: "내보낸 텍스트 파일(.txt)을 열고, 분석하고 싶은 구간의 대화를 전체 선택하여 복사(Ctrl+C)합니다.",
    },
    {
      title: "4. 여기에 붙여넣기",
      desc: "다시 이 화면으로 돌아와서 빈 칸에 대화 내용을 붙여넣고 분석 버튼을 누르면 끝!",
    }
  ];

  const handleNextStep = () => {
    if (guideStep < guideContents.length - 1) setGuideStep(guideStep + 1);
  };

  const handlePrevStep = () => {
    if (guideStep > 0) setGuideStep(guideStep - 1);
  };

  return (
    <section 
      ref={ref}
      className="relative w-full flex flex-col bg-transparent z-20"
    >
      <div className="max-w-md mx-auto w-full flex flex-col flex-1">

        {/* Model Info Box */}
        <div className="mb-8 bg-white border border-zinc-200 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md">
          <button 
            onClick={() => setIsModelInfoOpen(!isModelInfoOpen)}
            className="w-full flex justify-between items-center text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className="text-[14px] font-semibold text-zinc-800">바솔로뮤(Bartholomew) 성인 애착 모델이란?</span>
            </div>
            <svg className={`w-4 h-4 text-zinc-400 transform transition-transform ${isModelInfoOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isModelInfoOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4 pt-4 border-t border-zinc-100 text-[14px] text-zinc-600 leading-relaxed overflow-hidden"
            >
              심리학자 킴 바솔로뮤(Kim Bartholomew)가 제안한 4분할 애착 이론입니다. 자기 자신과 타인을 긍정하는지 부정하는지를 기준으로 <strong>안정형, 불안형, 거부-회피형, 공포-회피형</strong> 4가지로 분류합니다.<br/><br/>
              이 서비스는 AI가 카톡 대화의 텍스트 패턴을 분석하여, 상대방이 갈등 상황에서 보이는 방어기제와 회피 성향을 학술적 기준에 기반해 판독해 드립니다.
            </motion.div>
          )}
        </div>

        <div className="flex-1 flex flex-col mb-10">
          <div className="flex justify-between items-end mb-4">
            <label
              htmlFor="kakaotalk-log"
              className="block text-[15px] font-bold text-zinc-900"
            >
              대화 텍스트 입력
            </label>
            <button 
              onClick={() => {
                setGuideStep(0);
                setIsGuideOpen(true);
              }}
              className="text-[13px] text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 transition-colors bg-blue-50 px-2 py-1 rounded-md"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              카톡 대화 입력 가이드 보기
            </button>
          </div>
          
          <textarea
            id="kakaotalk-log"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full flex-1 min-h-[320px] p-5 bg-white border border-zinc-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none text-[15px] leading-relaxed text-zinc-800 placeholder-zinc-400 rounded-2xl shadow-sm"
            placeholder="[오후 11:32] 김회피: 나 지금 너무 피곤해서... 내일 연락할게.&#10;[오후 11:34] 나: 우리가 풀 건 풀어야지. 왜 매번 피하려고만 해?&#10;[오후 11:35] 김회피: 또 시작이네. 그만하자.&#10;&#10;*여기에 실제 대화를 길게 복사해서 붙여넣으세요.*"
          ></textarea>
        </div>

        <button 
          onClick={() => onAnalyze(text)}
          className="w-full py-4.5 bg-zinc-950 text-white font-bold text-[16px] rounded-xl transform transition-all hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 flex items-center justify-center gap-2 shadow-md mb-8"
        >
          회피 성향 심층 분석 시작
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>

        <footer className="mt-auto text-center text-[13px] text-zinc-400 font-medium pb-4">
          본 분석은 참고용이며 전문적인 심리 상담을 대체하지 않습니다.
        </footer>
      </div>

      {/* Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-5 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="font-semibold text-sm text-zinc-900">카카오톡 대화 가져오기</h3>
              <button onClick={() => setIsGuideOpen(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors bg-white rounded-full p-1 border border-zinc-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 flex-1 min-h-[180px] flex flex-col justify-center">
              <div className="text-xs font-semibold text-blue-600 mb-3 tracking-widest uppercase">Step {guideStep + 1} / {guideContents.length}</div>
              <h4 className="text-xl font-bold text-zinc-950 mb-3 leading-tight">{guideContents[guideStep].title}</h4>
              <p className="text-[15px] text-zinc-600 leading-relaxed">{guideContents[guideStep].desc}</p>
            </div>

            <div className="px-5 py-4 flex justify-between items-center border-t border-zinc-100 bg-zinc-50/50">
              <button 
                onClick={handlePrevStep}
                disabled={guideStep === 0}
                className={`text-[14px] font-semibold transition-colors ${guideStep === 0 ? 'text-zinc-300 cursor-not-allowed' : 'text-zinc-600 hover:text-zinc-900'}`}
              >
                이전
              </button>
              <div className="flex gap-2">
                {guideContents.map((_, idx) => (
                  <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === guideStep ? 'bg-blue-600 scale-125' : 'bg-zinc-200'}`} />
                ))}
              </div>
              {guideStep < guideContents.length - 1 ? (
                <button 
                  onClick={handleNextStep}
                  className="text-[14px] font-semibold text-zinc-900 hover:text-blue-600 transition-colors"
                >
                  다음
                </button>
              ) : (
                <button 
                  onClick={() => setIsGuideOpen(false)}
                  className="text-[14px] font-semibold px-4 py-2 bg-zinc-950 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  완료
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

InputSection.displayName = "InputSection";

export default InputSection;
