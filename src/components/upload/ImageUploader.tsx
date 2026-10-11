"use client";

import React, { useState, useRef } from "react";
import { processAndSliceImage, ProcessedSlice } from "@/lib/image/imageSlicer";

interface ImageUploaderProps {
  onImagesReady: (slices: Array<{ base64: string; mimeType: string }>) => void;
  onOpenGuide: () => void;
  disabled?: boolean;
}

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  isLongScreenshot: boolean;
  sliceCount: number;
}

export function ImageUploader({ onImagesReady, onOpenGuide, disabled = false }: ImageUploaderProps) {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (items.length + files.length > 5) {
      alert("캡처 이미지는 한 번에 최대 5장까지 업로드할 수 있습니다.");
      return;
    }

    setIsProcessing(true);
    const newItems: ImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const previewUrl = URL.createObjectURL(file);
      
      // Quick dimension check
      const isLong = await checkIsLongImage(file);

      newItems.push({
        id: `${Date.now()}-${i}`,
        file,
        previewUrl,
        isLongScreenshot: isLong,
        sliceCount: isLong ? 2 : 1
      });
    }

    const updated = [...items, ...newItems].slice(0, 5);
    setItems(updated);
    setIsProcessing(false);

    // Prepare slices
    await emitSlices(updated);
  };

  const checkIsLongImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img.naturalHeight > 2500);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleRemove = async (id: string) => {
    const target = items.find((it) => it.id === id);
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
    }
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    await emitSlices(updated);
  };

  const emitSlices = async (currentItems: ImageItem[]) => {
    if (currentItems.length === 0) {
      onImagesReady([]);
      return;
    }

    try {
      setIsProcessing(true);
      const allSlices: Array<{ base64: string; mimeType: string }> = [];

      for (const item of currentItems) {
        const slices: ProcessedSlice[] = await processAndSliceImage(item.file);
        for (const s of slices) {
          allSlices.push({
            base64: s.base64,
            mimeType: s.mimeType
          });
        }
      }

      onImagesReady(allSlices);
    } catch (err) {
      console.error("Image processing error:", err);
      alert("이미지 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      {/* Guide Trigger Button */}
      <div className="flex justify-between items-center mb-3">
        <label className="text-[15px] font-bold text-zinc-900 flex items-center gap-1.5">
          <span>카톡 캡처 사진 올리기</span>
          <span className="text-[12px] font-normal text-zinc-500">({items.length}/5장)</span>
        </label>
        <button
          type="button"
          onClick={onOpenGuide}
          className="text-[13px] text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          캡처 & 프로필 가리는 법
        </button>
      </div>

      {/* Main Upload Dropzone or Thumbnails */}
      {items.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full min-h-[260px] border-2 border-dashed border-zinc-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-white group shadow-xs"
        >
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 group-hover:bg-blue-50 group-hover:scale-105 text-zinc-500 group-hover:text-blue-600 flex items-center justify-center transition-all mb-3.5 shadow-inner">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-[15px] font-bold text-zinc-800 mb-1">
            터치하여 카톡 캡처 사진 선택하기
          </h4>
          <p className="text-[13px] text-zinc-500 text-center leading-relaxed mb-3">
            길게 캡처한 사진 1장도 고화질로 자동 인식됩니다.
            <br />
            <span className="text-[12px] text-zinc-400">(최대 5장 선택 가능)</span>
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full text-[11px] font-semibold text-zinc-600">
            🔒 프로필 가리기 캡처 권장 (개인정보 보호)
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="relative rounded-xl border border-zinc-200 overflow-hidden bg-zinc-950 group aspect-[3/4] flex flex-col justify-end shadow-sm"
              >
                {/* Image Preview */}
                <img
                  src={item.previewUrl}
                  alt={`캡처 ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition"
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-zinc-900/80 text-white flex items-center justify-center text-xs hover:bg-red-600 transition z-10"
                >
                  ✕
                </button>

                {/* Badge Overlay */}
                <div className="relative z-10 p-2 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent flex flex-col">
                  <span className="text-[11px] font-bold text-white">
                    사진 #{idx + 1}
                  </span>
                  {item.isLongScreenshot && (
                    <span className="text-[10px] text-blue-300 font-semibold flex items-center gap-0.5">
                      ✓ 긴 캡처 고화질 분할
                    </span>
                  )}
                </div>
              </div>
            ))}

            {items.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-2 border-dashed border-zinc-200 hover:border-blue-400 bg-zinc-50 hover:bg-blue-50/30 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-blue-600 transition aspect-[3/4]"
              >
                <span className="text-2xl font-light">+</span>
                <span className="text-[12px] font-bold">사진 추가</span>
              </button>
            )}
          </div>

          <div className="flex justify-between items-center pt-1 text-[12px] text-zinc-500">
            <span>총 {items.length}장의 대화 캡처가 등록되었습니다.</span>
            <button
              type="button"
              onClick={() => {
                items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
                setItems([]);
                onImagesReady([]);
              }}
              className="text-red-500 hover:text-red-600 font-semibold"
            >
              전체 비우기
            </button>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center gap-2 text-[12px] text-blue-700 font-medium animate-pulse">
          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          대화 이미지 고화질 분할 및 최적화 중...
        </div>
      )}
    </div>
  );
}
