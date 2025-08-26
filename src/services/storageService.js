import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import { compressImage } from "../utils/imageUtils";

/**
 * Upload'uje zdjęcia do Firebase Storage
 * @param {File[]} files - Lista plików do upload'u
 * @param {string} submissionId - ID submission'u (używane w ścieżce)
 * @param {Function} onProgress - Callback do raportowania postępu (opcjonalny)
 * @returns {Promise<string[]>} - Lista URL'i uploadowanych zdjęć
 */
export const uploadSubmissionPhotos = async (
  files,
  submissionId,
  onProgress,
) => {
  if (!files || files.length === 0) {
    return [];
  }

  const totalFiles = files.length;
  let completedFiles = 0;

  const uploadPromises = files.map(async (file, index) => {
    try {
      if (onProgress) {
        onProgress({
          current: completedFiles,
          total: totalFiles,
          message: `Kompresowanie zdjęcia ${index + 1}/${totalFiles}...`,
          percentage: Math.round((completedFiles / totalFiles) * 100),
        });
      }

      // Kompresuj obraz jeśli potrzeba
      const compressedFile = await compressImage(file);

      if (onProgress) {
        onProgress({
          current: completedFiles,
          total: totalFiles,
          message: `Przesyłanie zdjęcia ${index + 1}/${totalFiles}...`,
          percentage: Math.round((completedFiles / totalFiles) * 100),
        });
      }

      // Utwórz unikalną nazwę pliku
      const timestamp = Date.now();
      const fileName = `photo_${index + 1}_${timestamp}.jpg`;

      // Utwórz referencję do Firebase Storage
      const storageRef = ref(
        storage,
        `submissions/${submissionId}/${fileName}`,
      );

      // Upload pliku
      const snapshot = await uploadBytes(storageRef, compressedFile);

      // Pobierz URL do pobrania
      const downloadURL = await getDownloadURL(snapshot.ref);

      completedFiles++;
      if (onProgress) {
        onProgress({
          current: completedFiles,
          total: totalFiles,
          message: `Zakończono zdjęcie ${index + 1}/${totalFiles}`,
          percentage: Math.round((completedFiles / totalFiles) * 100),
        });
      }

      return downloadURL;
    } catch (error) {
      console.error(`Błąd podczas upload'u zdjęcia ${index + 1}:`, error);
      throw new Error(
        `Nie udało się upload'ować zdjęcia ${index + 1}: ${error.message}`,
      );
    }
  });

  try {
    const photoUrls = await Promise.all(uploadPromises);
    return photoUrls;
  } catch (error) {
    console.error("Błąd podczas upload'u zdjęć:", error);
    throw error;
  }
};

/**
 * Generuje unikalny ID dla submission'u
 * @returns {string} - Unikalny ID
 */
export const generateSubmissionId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
