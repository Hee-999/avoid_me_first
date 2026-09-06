"use client";

import React, { useState } from "react";

interface ShareAliasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (alias: string) => void;
  originalName: string;
}

export function ShareAliasModal({ isOpen, onClose, onShare, originalName }: ShareAliasModalProps) {
  const [selectedAlias, setSelectedAlias] = useState("상대방");
  const [customAlias, setCustomAlias] = useState("");
  
  if (!isOpen) return null;

  const handleShareClick = () => {
    let finalAlias = selectedAlias;
    if (selectedAlias === "custom") {
      finalAlias = customAlias.trim() || "상대방";
    } else if (selectedAlias === "original") {
      finalAlias = originalName;
    }
    
    // Max length 20
    finalAlias = finalAlias.substring(0, 20);
    onShare(finalAlias);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0">
      <div 
        className="w-full sm:max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300"
        role="dialog"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            공유할 때 상대를<br/>어떻게 표시할까요?
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <label className="flex items-center p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
            <input 
              type="radio" 
              name="alias" 
              value="상대방" 
              checked={selectedAlias === "상대방"} 
              onChange={() => setSelectedAlias("상대방")}
              className="w-5 h-5 text-black accent-black"
            />
            <span className="ml-3 text-neutral-800 dark:text-neutral-200 font-medium">상대방 (기본)</span>
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            {["남자친구", "여자친구", "썸남", "썸녀"].map((preset) => (
              <label key={preset} className="flex items-center p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <input 
                  type="radio" 
                  name="alias" 
                  value={preset} 
                  checked={selectedAlias === preset} 
                  onChange={() => setSelectedAlias(preset)}
                  className="w-5 h-5 text-black accent-black"
                />
                <span className="ml-3 text-neutral-800 dark:text-neutral-200 font-medium">{preset}</span>
              </label>
            ))}
          </div>

          <label className="flex items-center p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
            <input 
              type="radio" 
              name="alias" 
              value="original" 
              checked={selectedAlias === "original"} 
              onChange={() => setSelectedAlias("original")}
              className="w-5 h-5 text-black accent-black shrink-0"
            />
            <span className="ml-3 text-neutral-800 dark:text-neutral-200 font-medium truncate">
              원래 이름 사용: {originalName}
            </span>
          </label>

          <div className={`p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl transition-all ${selectedAlias === "custom" ? "bg-neutral-50 dark:bg-neutral-800/30" : ""}`}>
            <label className="flex items-center cursor-pointer mb-2">
              <input 
                type="radio" 
                name="alias" 
                value="custom" 
                checked={selectedAlias === "custom"} 
                onChange={() => setSelectedAlias("custom")}
                className="w-5 h-5 text-black accent-black shrink-0"
              />
              <span className="ml-3 text-neutral-800 dark:text-neutral-200 font-medium">직접 입력</span>
            </label>
            {selectedAlias === "custom" && (
              <input
                type="text"
                placeholder="예: 전남친, 직장동료 (최대 20자)"
                maxLength={20}
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="w-full mt-2 p-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-neutral-900 dark:text-white"
                autoFocus
              />
            )}
          </div>
        </div>

        <button 
          onClick={handleShareClick}
          className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
        >
          이 이름으로 공유하기
        </button>
        
        <p className="text-center text-xs text-neutral-500 mt-4">
          선택하신 이름만 공유 페이지에 노출됩니다.
        </p>
      </div>
    </div>
  );
}
