import React from 'react';
import Link from 'next/link';
import { businessConfig } from '@/config/business';

export const Footer = () => {
  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 mt-auto print:hidden text-zinc-500 py-8 px-6 text-[12px] leading-relaxed">
      <div className="flex flex-wrap gap-4 mb-6 font-semibold text-zinc-700">
        <Link href="/terms" className="hover:text-blue-600 transition-colors">이용약관</Link>
        <Link href="/privacy" className="hover:text-blue-600 transition-colors">개인정보처리방침</Link>
        <Link href="/refund" className="hover:text-blue-600 transition-colors">결제 및 환불정책</Link>
      </div>
      
      <div className="space-y-1">
        <p><strong>상호:</strong> {businessConfig.companyName} | <strong>대표:</strong> {businessConfig.representativeName}</p>
        <p><strong>사업자등록번호:</strong> {businessConfig.businessRegistrationNumber}</p>
        <p><strong>통신판매업 신고번호:</strong> {businessConfig.mailOrderRegistrationNumber}</p>
        <p><strong>사업장 주소:</strong> {businessConfig.businessAddress}</p>
        <p><strong>고객센터:</strong> <a href={`mailto:${businessConfig.supportEmail}`} className="hover:text-zinc-800 underline">{businessConfig.supportEmail}</a></p>
      </div>

      <p className="mt-6 text-zinc-400">
        © {new Date().getFullYear()} {businessConfig.companyName}. All rights reserved.
      </p>
    </footer>
  );
};
