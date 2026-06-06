export const MAX_IMAGE_UPLOAD_SIZE_BYTES = 3 * 1024 * 1024;
export const MAX_IMAGE_UPLOAD_SIZE_MB = 3;

export const ALLOWED_IMAGE_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const IMAGE_UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp";

export const validateImageUploadFile = (file: File | null | undefined) => {
  if (!file) return "";
  if (!ALLOWED_IMAGE_UPLOAD_TYPES.has(file.type)) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }
  if (file.size > MAX_IMAGE_UPLOAD_SIZE_BYTES) {
    return `Image file must be ${MAX_IMAGE_UPLOAD_SIZE_MB} MB or smaller.`;
  }
  return "";
};
