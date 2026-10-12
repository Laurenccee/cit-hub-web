import type { UploadActionResult } from "@/types/action";

type UploadAvatarAction = (
  formData: FormData,
  oldUrl?: string | null,
) => Promise<UploadActionResult>;

/**
 * Uploads a freshly selected avatar blob (if any) and returns the URL to
 * persist. Shared by the personnel and student forms, which both stage the
 * picked file in a ref until submit rather than uploading eagerly.
 */
export async function uploadPendingAvatar(
  pendingBlob: Blob | null,
  uploadAvatarAction: UploadAvatarAction,
  currentUrl?: string,
): Promise<string | undefined> {
  if (!pendingBlob) return currentUrl;

  const formData = new FormData();
  formData.append("file", pendingBlob, "profile.jpg");

  const uploadResult = await uploadAvatarAction(formData, currentUrl);
  if (!uploadResult.success) {
    throw new Error(uploadResult.message ?? "Failed to upload photo.");
  }
  return uploadResult.url;
}
