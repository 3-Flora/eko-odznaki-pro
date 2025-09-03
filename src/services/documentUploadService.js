// 📄 SERVICE: Obsługa uploadu dokumentów dla wniosków nauczycieli
// src/services/documentUploadService.js

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { storage, db } from "./firebase";

/**
 * 🔒 BEZPIECZNY UPLOAD DOKUMENTÓW NAUCZYCIELI
 * Uploaduje dokumenty do Firebase Storage z walidacją i bezpieczeństwem
 */
export class DocumentUploadService {
  
  // Dozwolone typy plików
  static ALLOWED_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png', 
    'application/pdf': '.pdf'
  };
  
  // Maksymalne rozmiary plików (w bajtach)
  static MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  /**
   * Waliduje plik przed uploadem
   */
  static validateFile(file, documentType) {
    const errors = [];
    
    // Sprawdź czy plik istnieje
    if (!file) {
      errors.push("Plik jest wymagany");
      return errors;
    }
    
    // Sprawdź rozmiar
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`Plik jest za duży. Maksymalny rozmiar: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    
    // Sprawdź typ pliku
    if (!this.ALLOWED_TYPES[file.type]) {
      errors.push(`Nieprawidłowy typ pliku. Dozwolone: ${Object.values(this.ALLOWED_TYPES).join(', ')}`);
    }
    
    // Sprawdź typ dokumentu
    if (!['idCard', 'employmentCertificate'].includes(documentType)) {
      errors.push("Nieprawidłowy typ dokumentu");
    }
    
    return errors;
  }
  
  /**
   * Uploaduje dokument dla wniosku nauczyciela
   */
  static async uploadTeacherDocument(applicationId, file, documentType, userId) {
    try {
      // Walidacja
      const validationErrors = this.validateFile(file, documentType);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }
      
      // Generuj bezpieczną nazwę pliku
      const fileExtension = this.ALLOWED_TYPES[file.type];
      const fileName = documentType === 'idCard' ? 'id-card' : 'employment-cert';
      const storagePath = `teacher-applications/${applicationId}/${fileName}${fileExtension}`;
      
      // Upload do Firebase Storage
      const storageRef = ref(storage, storagePath);
      const uploadResult = await uploadBytes(storageRef, file);
      
      // Przygotuj metadata dokumentu
      const documentData = {
        fileName: file.name,
        storagePath: storagePath,
        uploadedAt: new Date(),
        fileSize: file.size,
        mimeType: file.type,
        verified: false
      };
      
      // Aktualizuj wniosek w Firestore
      const applicationRef = doc(db, 'teacherApplications', applicationId);
      const updatePath = `documents.${documentType}`;
      
      await updateDoc(applicationRef, {
        [updatePath]: documentData,
        // Dodaj wpis do audit log
        auditLog: arrayUnion({
          action: 'document_uploaded',
          timestamp: new Date(),
          performedBy: userId,
          details: `Uploaded ${documentType} document: ${file.name}`,
          documentType: documentType
        })
      });
      
      return {
        success: true,
        storagePath: storagePath,
        documentData: documentData
      };
      
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error(`Nie udało się przesłać dokumentu: ${error.message}`);
    }
  }
  
  /**
   * Pobiera URL do podglądu dokumentu (tylko dla uprawnnionych użytkowników)
   */
  static async getDocumentDownloadURL(storagePath) {
    try {
      const storageRef = ref(storage, storagePath);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw new Error('Nie udało się pobrać dokumentu');
    }
  }
  
  /**
   * Usuwa dokument (tylko dla ekoskop lub w przypadku odrzucenia)
   */
  static async deleteDocument(storagePath, applicationId, documentType, userId) {
    try {
      // Usuń z Storage
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      
      // Usuń reference z Firestore
      const applicationRef = doc(db, 'teacherApplications', applicationId);
      const updatePath = `documents.${documentType}`;
      
      await updateDoc(applicationRef, {
        [updatePath]: null,
        auditLog: arrayUnion({
          action: 'document_deleted',
          timestamp: new Date(),
          performedBy: userId,
          details: `Deleted ${documentType} document`,
          documentType: documentType
        })
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Nie udało się usunąć dokumentu');
    }
  }
  
  /**
   * Weryfikuje dokument (tylko dla ekoskop)
   */
  static async verifyDocument(applicationId, documentType, verified, userId) {
    try {
      const applicationRef = doc(db, 'teacherApplications', applicationId);
      const updatePath = `documents.${documentType}.verified`;
      
      await updateDoc(applicationRef, {
        [updatePath]: verified,
        auditLog: arrayUnion({
          action: verified ? 'document_verified' : 'document_unverified',
          timestamp: new Date(),
          performedBy: userId,
          details: `${verified ? 'Verified' : 'Unverified'} ${documentType} document`,
          documentType: documentType
        })
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error verifying document:', error);
      throw new Error('Nie udało się zweryfikować dokumentu');
    }
  }
}

export default DocumentUploadService;
