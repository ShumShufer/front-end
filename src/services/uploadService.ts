import httpClient from "./api/httpClient.ts";

export interface UploadResponse {
  url: string;
  filename: string;
  contentType: string;
  sizeBytes?: number;
}

class UploadService {
  /**
   * Upload a file to the backend storage and return its public URL.
   */
  async uploadFile(file: File): Promise<UploadResponse> {
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

    const res = await httpClient.post<any, any>("/uploads", {
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      fileData: base64Data,
    });
    const payload = (res && typeof res === "object" && "url" in res) ? res : res?.data ?? res;
    return {
      url: payload.url,
      filename: payload.filename ?? file.name,
      contentType: payload.contentType ?? file.type,
      sizeBytes: payload.sizeBytes ?? file.size,
    };
  }
}

export const uploadService = new UploadService();
