/**
 * Converts a File object to a base64 string
 * @param file The file to convert
 * @returns A promise that resolves to the base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Converts multiple files to base64 strings
 * @param files Array of files to convert
 * @returns A promise that resolves to an array of base64 strings
 */
export const filesToBase64 = async (files: File[]): Promise<string[]> => {
  const promises = files.map((file) => fileToBase64(file));
  return Promise.all(promises);
};
