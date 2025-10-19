import { http } from "@frameworks/http/httpInstance";
import { tryCatchAsync } from "@wingmnn/utils";

export const UploadService = (function () {
  const uploadFile = async (
    file: File | Blob,
    bucket: string = "uploads",
  ): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);

    const { result, error } = await tryCatchAsync(
      http.post<Attachment>("storage/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    );

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    return result;
  };

  return {
    image(file: File): Promise<Attachment> {
      return uploadFile(file, "images");
    },
    pdf(file: File): Promise<Attachment> {
      return uploadFile(file, "documents");
    },
    blob(blob: Blob): Promise<Attachment> {
      return uploadFile(blob, "blobs");
    },
  };
})();
