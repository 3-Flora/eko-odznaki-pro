/**
 * Utility funkcje do obsługi obrazów - kompresja, upload do Firebase Storage
 */

/**
 * Kompresuje obraz do określonego rozmiaru (max 15MB)
 * @param {File} file - Plik obrazu do kompresji
 * @param {number} maxSizeInMB - Maksymalny rozmiar w MB (domyślnie 15)
 * @param {number} quality - Jakość kompresji (0.1 - 1.0, domyślnie 0.8)
 * @returns {Promise<File>} - Skompresowany plik
 */
export const compressImage = async (file, maxSizeInMB = 15, quality = 0.8) => {
  // Jeśli plik jest już mniejszy niż limit, zwróć oryginalny
  if (file.size <= maxSizeInMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Oblicz nowe wymiary (zachowaj proporcje)
      let { width, height } = img;
      const maxDimension = 1920; // Maksymalna szerokość/wysokość

      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }

      canvas.width = width;
      canvas.height = height;

      // Narysuj obraz na canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Konwertuj canvas do blob z kompresją
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        "image/jpeg",
        quality,
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Waliduje plik obrazu
 * @param {File} file - Plik do walidacji
 * @returns {Object} - Obiekt z wynikiem walidacji
 */
export const validateImageFile = (file) => {
  const maxSize = 15 * 1024 * 1024; // 15MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!file) {
    return {
      isValid: false,
      error: "Nie wybrano pliku",
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Nieprawidłowy typ pliku "${file.name}". Dozwolone: JPG, PNG, WebP`,
    };
  }

  if (file.size > maxSize) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Plik "${file.name}" jest za duży (${fileSizeMB}MB). Maksymalny rozmiar: 15MB`,
    };
  }

  return { isValid: true };
};

/**
 * Waliduje wiele plików na raz
 * @param {File[]} files - Lista plików do walidacji
 * @param {number} maxFiles - Maksymalna liczba plików
 * @param {number} maxTotalSizeMB - Maksymalny całkowity rozmiar w MB
 * @returns {Object} - Obiekt z wynikiem walidacji
 */
export const validateMultipleImageFiles = (
  files,
  maxFiles = 4,
  maxTotalSizeMB = 50,
) => {
  if (!files || files.length === 0) {
    return {
      isValid: false,
      error: "Nie wybrano żadnych plików",
    };
  }

  if (files.length > maxFiles) {
    return {
      isValid: false,
      error: `Za dużo plików. Maksymalnie można wybrać ${maxFiles} zdjęć, wybrano ${files.length}`,
    };
  }

  // Sprawdź całkowity rozmiar
  const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);
  const totalSizeMB = totalSize / (1024 * 1024);

  if (totalSizeMB > maxTotalSizeMB) {
    return {
      isValid: false,
      error: `Całkowity rozmiar plików jest za duży (${totalSizeMB.toFixed(1)}MB). Maksymalnie: ${maxTotalSizeMB}MB`,
    };
  }

  // Waliduj każdy plik
  for (let i = 0; i < files.length; i++) {
    const validation = validateImageFile(files[i]);
    if (!validation.isValid) {
      return validation;
    }
  }

  return { isValid: true };
};

/**
 * Tworzy preview URL dla pliku obrazu
 * @param {File} file - Plik obrazu
 * @returns {Promise<string>} - URL preview
 */
export const createImagePreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
};

/**
 * Oblicza całkowity rozmiar plików w MB
 * @param {File[]} files - Lista plików
 * @returns {number} - Rozmiar w MB
 */
export const calculateTotalSizeMB = (files) => {
  if (!files || files.length === 0) return 0;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  return totalBytes / (1024 * 1024);
};

/**
 * Formatuje rozmiar pliku do czytelnej formy
 * @param {number} bytes - Rozmiar w bajtach
 * @returns {string} - Sformatowany rozmiar
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
