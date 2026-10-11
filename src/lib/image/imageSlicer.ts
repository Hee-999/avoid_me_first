/**
 * Smart Client-Side Image Slicer for KakaoTalk Screenshots.
 * Prevents text degradation in ultra-long vertical screenshots by slicing into
 * high-resolution segments with overlapping margins for vision models.
 */

export interface ProcessedSlice {
  base64: string;
  mimeType: string;
  sliceIndex: number;
  totalSlices: number;
}

const MAX_WIDTH = 1080;
const SLICE_HEIGHT = 2000;
const OVERLAP_HEIGHT = 300; // 15% overlap to ensure no text bubble is cut in half
const MAX_VERTICAL_WITHOUT_SLICE = 2500;

export async function processAndSliceImage(file: File): Promise<ProcessedSlice[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const slices = sliceImage(img);
          resolve(slices);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("이미지 로드에 실패했습니다."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("파일 읽기에 실패했습니다."));
    reader.readAsDataURL(file);
  });
}

function sliceImage(img: HTMLImageElement): ProcessedSlice[] {
  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  // Scale factor to normalize width to MAX_WIDTH (1080px)
  const scale = origWidth > MAX_WIDTH ? MAX_WIDTH / origWidth : 1;
  const targetWidth = Math.round(origWidth * scale);
  const targetHeight = Math.round(origHeight * scale);

  // If height is normal, no slicing needed
  if (targetHeight <= MAX_VERTICAL_WITHOUT_SLICE) {
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context creation failed");

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    const base64 = dataUrl.split(",")[1];

    return [
      {
        base64,
        mimeType: "image/jpeg",
        sliceIndex: 0,
        totalSlices: 1
      }
    ];
  }

  // Ultra-long image: Slice into chunks with overlap
  const slices: ProcessedSlice[] = [];
  let currentY = 0;
  let sliceIndex = 0;

  // Temporary canvas to render scaled full image
  const fullCanvas = document.createElement("canvas");
  fullCanvas.width = targetWidth;
  fullCanvas.height = targetHeight;
  const fullCtx = fullCanvas.getContext("2d");
  if (!fullCtx) throw new Error("Canvas context creation failed");
  fullCtx.drawImage(img, 0, 0, targetWidth, targetHeight);

  while (currentY < targetHeight) {
    const remainingHeight = targetHeight - currentY;
    const currentSliceHeight = Math.min(SLICE_HEIGHT, remainingHeight);

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = targetWidth;
    sliceCanvas.height = currentSliceHeight;
    const sliceCtx = sliceCanvas.getContext("2d");
    if (!sliceCtx) throw new Error("Slice canvas context failed");

    // Copy region from fullCanvas to sliceCanvas
    sliceCtx.drawImage(
      fullCanvas,
      0,
      currentY,
      targetWidth,
      currentSliceHeight,
      0,
      0,
      targetWidth,
      currentSliceHeight
    );

    const dataUrl = sliceCanvas.toDataURL("image/jpeg", 0.88);
    const base64 = dataUrl.split(",")[1];

    slices.push({
      base64,
      mimeType: "image/jpeg",
      sliceIndex,
      totalSlices: 0 // will update after loop
    });

    sliceIndex++;
    if (currentY + currentSliceHeight >= targetHeight) {
      break;
    }
    // Advance with overlap
    currentY += currentSliceHeight - OVERLAP_HEIGHT;
  }

  // Update total slices count
  slices.forEach((s) => (s.totalSlices = slices.length));
  return slices;
}
