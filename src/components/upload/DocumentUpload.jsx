// 📎 KOMPONENT: Upload dokumentów dla wniosków nauczycieli
// src/components/upload/DocumentUpload.jsx

import { useState, useRef } from "react";
import { Upload, File, CheckCircle, AlertCircle, X, Eye } from "lucide-react";
import DocumentUploadService from "../../services/documentUploadService";
import Button from "../ui/Button";
import clsx from "clsx";

export default function DocumentUpload({
  applicationId,
  documentType,
  currentDocument,
  onUploadSuccess,
  onUploadError,
  userId,
  disabled = false,
  canView = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const documentLabels = {
    idCard: "Skan legitymacji służbowej",
    employmentCertificate: "Zaświadczenie o zatrudnieniu",
  };

  const handleFileSelect = async (file) => {
    if (!file || disabled) return;

    try {
      setUploading(true);

      const result = await DocumentUploadService.uploadTeacherDocument(
        applicationId,
        file,
        documentType,
        userId,
      );

      if (onUploadSuccess) {
        onUploadSuccess(documentType, result.documentData);
      }
    } catch (error) {
      console.error("Upload error:", error);
      if (onUploadError) {
        onUploadError(error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleViewDocument = async () => {
    if (!currentDocument?.storagePath) return;

    try {
      const downloadURL = await DocumentUploadService.getDocumentDownloadURL(
        currentDocument.storagePath,
      );
      window.open(downloadURL, "_blank");
    } catch (error) {
      if (onUploadError) {
        onUploadError("Nie udało się otworzyć dokumentu");
      }
    }
  };

  const handleRemoveDocument = async () => {
    if (!currentDocument?.storagePath) return;

    try {
      await DocumentUploadService.deleteDocument(
        currentDocument.storagePath,
        applicationId,
        documentType,
        userId,
      );

      if (onUploadSuccess) {
        onUploadSuccess(documentType, null);
      }
    } catch (error) {
      if (onUploadError) {
        onUploadError("Nie udało się usunąć dokumentu");
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {documentLabels[documentType]}
          {!disabled && <span className="ml-1 text-red-500">*</span>}
        </label>

        {/* Jeśli dokument już istnieje */}
        {currentDocument ? (
          <div className="rounded-lg border-2 border-gray-200 p-4 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={clsx(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                    currentDocument.verified
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-blue-100 dark:bg-blue-900",
                  )}
                >
                  {currentDocument.verified ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <File className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentDocument.fileName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(currentDocument.fileSize)} • Przesłano{" "}
                    {new Date(
                      currentDocument.uploadedAt?.seconds * 1000 ||
                        currentDocument.uploadedAt,
                    ).toLocaleDateString()}
                  </p>
                  {currentDocument.verified && (
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                      ✓ Zweryfikowano przez ekoskop
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {canView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewDocument}
                    className="p-2"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}

                {!disabled && !currentDocument.verified && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveDocument}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Obszar upload gdy brak dokumentu */
          <div
            className={clsx(
              "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors",
              dragActive
                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-gray-400 dark:hover:border-gray-500",
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileInput}
              disabled={disabled}
            />

            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Przesyłanie dokumentu...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload
                  className={clsx(
                    "mb-2 h-8 w-8",
                    disabled
                      ? "text-gray-400"
                      : "text-gray-500 dark:text-gray-400",
                  )}
                />
                <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                  Kliknij aby wybrać plik lub przeciągnij tutaj
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, PDF do 10MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Informacje o wymaganiach */}
      <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
        <div className="flex items-start">
          <AlertCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-blue-500" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="mb-1 font-medium">Wymagania dla dokumentu:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Format: JPG, PNG lub PDF</li>
              <li>Maksymalny rozmiar: 10MB</li>
              <li>Dokument musi być czytelny i aktualny</li>
              {documentType === "employmentCertificate" && (
                <li>Zaświadczenie musi być podpisane przez dyrektora</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
