import React from 'react';
import Link from 'next/link';

interface LegalLayoutProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ title, lastUpdated, children }) => {
  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-5 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-800 mb-8 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          서비스 홈으로 돌아가기
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="px-6 py-8 sm:p-10 border-b border-zinc-100">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">{title}</h1>
            {lastUpdated && <p className="mt-2 text-sm text-zinc-500">마지막 업데이트: {lastUpdated}</p>}
          </div>
          <div className="px-6 py-8 sm:p-10 prose prose-zinc prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-headings:text-zinc-900 prose-a:text-blue-600 hover:prose-a:text-blue-500">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
