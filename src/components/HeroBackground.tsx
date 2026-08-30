export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.15]">
      {/* Network Nodes */}
      <svg className="absolute top-10 left-10 w-64 h-64 animate-[spin_60s_linear_infinite]" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="100" cy="20" r="4" fill="#334155" className="animate-pulse" />
        <circle cx="169" cy="60" r="6" fill="#334155" className="animate-pulse" style={{ animationDelay: '1s' }} />
        <circle cx="169" cy="140" r="3" fill="#334155" className="animate-pulse" style={{ animationDelay: '2s' }} />
        <circle cx="100" cy="180" r="5" fill="#334155" className="animate-pulse" style={{ animationDelay: '3s' }} />
        <circle cx="31" cy="140" r="4" fill="#334155" className="animate-pulse" style={{ animationDelay: '4s' }} />
        <circle cx="31" cy="60" r="7" fill="#334155" className="animate-pulse" style={{ animationDelay: '5s' }} />
        <path d="M100 20 L169 60 L169 140 L100 180 L31 140 L31 60 Z" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
      </svg>

      {/* Abstract Chat Bubbles */}
      <div className="absolute top-[20%] right-[10%] w-48 h-16 bg-zinc-400 rounded-2xl rounded-tr-sm animate-[bounce_8s_infinite] opacity-40 blur-[1px]"></div>
      <div className="absolute top-[35%] right-[20%] w-32 h-12 bg-zinc-500 rounded-2xl rounded-br-sm animate-[bounce_10s_infinite_reverse] opacity-30 blur-[2px]" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[30%] left-[10%] w-56 h-20 bg-zinc-300 rounded-2xl rounded-tl-sm animate-[bounce_12s_infinite] opacity-50 blur-[1px]" style={{ animationDelay: '1s' }}></div>

      {/* Analysis Card Silhouette */}
      <div className="absolute top-[40%] left-[5%] w-64 h-72 bg-gradient-to-b from-zinc-200 to-transparent border border-zinc-300 rounded-xl transform -rotate-12 animate-[pulse_6s_infinite] opacity-40 blur-[1px]">
        <div className="w-3/4 h-4 bg-zinc-300 rounded mt-6 ml-6"></div>
        <div className="w-1/2 h-3 bg-zinc-300 rounded mt-3 ml-6"></div>
        <div className="w-5/6 h-32 bg-zinc-300 rounded mt-6 ml-6 opacity-50"></div>
      </div>

      {/* Wave lines */}
      <svg className="absolute bottom-0 left-0 w-full h-48 opacity-50" preserveAspectRatio="none" viewBox="0 0 1440 320">
        <path fill="none" stroke="#94a3b8" strokeWidth="1" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128" className="animate-[pulse_4s_infinite]"></path>
        <path fill="none" stroke="#64748b" strokeWidth="0.5" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,240C672,256,768,224,864,213.3C960,203,1056,213,1152,229.3C1248,245,1344,256,1392,261.3L1440,266.7" className="animate-[pulse_5s_infinite_reverse]"></path>
      </svg>
    </div>
  );
}
