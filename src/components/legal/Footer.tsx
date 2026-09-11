import React from 'react';
import Link from 'next/link';
import { businessConfig } from '@/config/business';

interface FooterProps {
  className?: string;
  isEmbedded?: boolean;
}

export const Footer = ({ className = '', isEmbedded = false }: FooterProps) => {
  const ftcLink = `https://www.ftc.go.kr/bizCommPop.do?wrkr_no=${businessConfig.businessRegistrationNumber.replace(/-/g, '')}`;

  return (
    <footer className={`${isEmbedded ? 'mt-6 pt-6 border-t border-zinc-200 text-left' : 'bg-zinc-50 border-t border-zinc-200 mt-auto print:hidden py-10 px-6'} text-zinc-500 text-[11px] leading-relaxed break-keep ${className}`}>
      <div className={isEmbedded ? 'w-full' : 'max-w-md mx-auto'}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-4 font-semibold text-zinc-600">
          <Link href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">이용약관</Link>
          <span className="text-zinc-300">|</span>
          <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">개인정보처리방침</Link>
          <span className="text-zinc-300">|</span>
          <Link href="/refund" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">환불 및 취소정책</Link>
          <span className="text-zinc-300">|</span>
          <a href={ftcLink} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors underline underline-offset-2">사업자정보확인</a>
        </div>
        
        <div className="space-y-1.5 text-zinc-500">
          <p className="flex flex-wrap items-center gap-x-2">
            <span><strong className="font-semibold text-zinc-700">상호명 :</strong> {businessConfig.companyName} ({businessConfig.brandName})</span>
            <span className="text-zinc-300">|</span>
            <span><strong className="font-semibold text-zinc-700">대표 :</strong> {businessConfig.representativeName}</span>
          </p>
          <p className="flex flex-wrap items-center gap-x-2">
            <span><strong className="font-semibold text-zinc-700">사업자등록번호 :</strong> {businessConfig.businessRegistrationNumber}</span>
            <span className="text-zinc-300 hidden sm:inline">|</span>
            <span><strong className="font-semibold text-zinc-700">통신판매업신고 :</strong> {businessConfig.mailOrderRegistrationNumber}</span>
          </p>
          <p>
            <strong className="font-semibold text-zinc-700">사업장 주소 :</strong> {businessConfig.businessAddress}
          </p>
          <p className="flex flex-wrap items-center gap-x-2">
            <span><strong className="font-semibold text-zinc-700">전화 :</strong> <a href={`tel:${businessConfig.supportPhone}`} className="hover:text-zinc-900 underline">{businessConfig.supportPhone}</a></span>
            <span className="text-zinc-300">|</span>
            <span><strong className="font-semibold text-zinc-700">이메일 :</strong> <a href={`mailto:${businessConfig.supportEmail}`} className="hover:text-zinc-900 underline">{businessConfig.supportEmail}</a></span>
          </p>
        </div>

        <p className="mt-4 text-zinc-400 font-normal">
          © {new Date().getFullYear()} {businessConfig.companyName}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

