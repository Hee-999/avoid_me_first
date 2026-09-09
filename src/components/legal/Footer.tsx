import React from 'react';
import Link from 'next/link';
import { businessConfig } from '@/config/business';

export const Footer = () => {
  const ftcLink = `http://www.ftc.go.kr/bizCommPop.do?wrkr_no=${businessConfig.businessRegistrationNumber.replace(/-/g, '')}`;

  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 mt-auto print:hidden text-zinc-500 py-10 px-6 text-[12px] leading-relaxed">
      <div className="max-w-md mx-auto">
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 font-semibold text-zinc-600">
          <Link href="/terms" className="hover:text-zinc-900 transition-colors">이용약관</Link>
          <Link href="/privacy" className="hover:text-zinc-900 transition-colors">개인정보처리방침</Link>
          <Link href="/refund" className="hover:text-zinc-900 transition-colors">환불 및 취소정책</Link>
          <a href={ftcLink} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">사업자정보확인</a>
        </div>
        
        <div className="space-y-1.5 break-keep">
          <p className="flex flex-wrap items-center gap-x-2">
            <span><strong>상호:</strong> {businessConfig.companyName}</span>
            <span className="text-zinc-300">|</span>
            <span><strong>대표:</strong> {businessConfig.representativeName}</span>
          </p>
          <p className="flex flex-wrap items-center gap-x-2">
            <span><strong>사업자등록번호:</strong> {businessConfig.businessRegistrationNumber}</span>
            <span className="text-zinc-300 hidden sm:inline">|</span>
            <span className="block sm:inline"><strong>통신판매업 신고번호:</strong> {businessConfig.mailOrderRegistrationNumber}</span>
          </p>
          <p><strong>사업장 주소:</strong> {businessConfig.businessAddress}</p>
          <p className="flex flex-wrap items-center gap-x-2">
            <span><strong>고객센터:</strong> <a href={`tel:${businessConfig.supportPhone}`} className="hover:text-zinc-800 underline">{businessConfig.supportPhone}</a></span>
            <span className="text-zinc-300">|</span>
            <span><strong>이메일:</strong> <a href={`mailto:${businessConfig.supportEmail}`} className="hover:text-zinc-800 underline">{businessConfig.supportEmail}</a></span>
          </p>
        </div>

        <p className="mt-8 text-zinc-400 font-medium">
          © 2026 {businessConfig.brandName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
