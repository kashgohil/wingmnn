export const UploadService = (function () {
  return {
    image(file: File): Promise<Attachment> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {};
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    pdf(file: File): Promise<Attachment> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {};
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    blob(blob: Blob): Promise<Attachment> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {};
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    },
  };
})();
