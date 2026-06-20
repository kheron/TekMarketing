export const LOGO_ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const LOGO_MAX_INPUT_BYTES = 2 * 1024 * 1024;
export const LOGO_MAX_DIMENSION = 512;
export const LOGO_TARGET_MAX_BYTES = 180_000;

export type LogoPosition = "bottom-right" | "bottom-left" | "top-right";

export interface ProcessedLogo {
  dataUrl: string;
  width: number;
  height: number;
  mimeType: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality = 0.92
): string {
  if (mimeType === "image/png") {
    return canvas.toDataURL("image/png");
  }
  return canvas.toDataURL("image/jpeg", quality);
}

export async function processLogoFile(file: File): Promise<ProcessedLogo> {
  if (!LOGO_ACCEPTED_TYPES.includes(file.type as (typeof LOGO_ACCEPTED_TYPES)[number])) {
    throw new Error("Logo must be PNG, JPEG, or WebP");
  }
  if (file.size > LOGO_MAX_INPUT_BYTES) {
    throw new Error("Logo must be under 2 MB");
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, LOGO_MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not process logo");
    ctx.drawImage(img, 0, 0, width, height);
    let mimeType = file.type === "image/webp" ? "image/png" : file.type;
    let quality = 0.92;
    let dataUrl = canvasToDataUrl(canvas, mimeType, quality);
    while (dataUrl.length > LOGO_TARGET_MAX_BYTES && quality > 0.5) {
      quality -= 0.08;
      mimeType = "image/jpeg";
      dataUrl = canvasToDataUrl(canvas, mimeType, quality);
    }
    if (dataUrl.length > LOGO_TARGET_MAX_BYTES) {
      throw new Error("Logo is too detailed — try a simpler image under 512px");
    }
    return { dataUrl, width, height, mimeType };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export interface OverlayLogoOptions {
  position?: LogoPosition;
  maxWidthRatio?: number;
  paddingRatio?: number;
}

export async function overlayLogoOnImage(
  imageBase64: string,
  imageMimeType: string,
  logoDataUrl: string,
  options: OverlayLogoOptions = {}
): Promise<{ base64: string; mimeType: string }> {
  const { position = "bottom-right", maxWidthRatio = 0.18, paddingRatio = 0.04 } = options;
  const imageSrc = `data:${imageMimeType};base64,${imageBase64}`;
  const [baseImage, logoImage] = await Promise.all([loadImage(imageSrc), loadImage(logoDataUrl)]);
  const canvas = document.createElement("canvas");
  canvas.width = baseImage.naturalWidth;
  canvas.height = baseImage.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not composite logo");
  ctx.drawImage(baseImage, 0, 0);
  const padding = Math.round(canvas.width * paddingRatio);
  const maxLogoWidth = Math.round(canvas.width * maxWidthRatio);
  const scale = Math.min(1, maxLogoWidth / logoImage.naturalWidth);
  const logoWidth = Math.round(logoImage.naturalWidth * scale);
  const logoHeight = Math.round(logoImage.naturalHeight * scale);
  let x = padding;
  let y = padding;
  if (position.includes("right")) x = canvas.width - logoWidth - padding;
  if (position.includes("bottom")) y = canvas.height - logoHeight - padding;
  ctx.drawImage(logoImage, x, y, logoWidth, logoHeight);
  const outputMime = imageMimeType === "image/jpeg" || imageMimeType === "image/webp" ? imageMimeType : "image/png";
  const dataUrl = canvasToDataUrl(canvas, outputMime, 0.92);
  const base64 = dataUrl.split(",")[1] ?? "";
  return { base64, mimeType: outputMime };
}