import { ref, uploadBytes, getDownloadURL, listAll, deleteObject, FirebaseStorage } from "firebase/storage";
import { storage as firebaseStorage } from "./firebase";

function getStorage(): FirebaseStorage {
  if (!firebaseStorage) throw new Error("Firebase Storage is not initialized (not in browser)");
  return firebaseStorage;
}

export interface FileUploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
  fullPath: string;
}

export class StorageService {
  static async uploadFile(file: File, path?: string): Promise<FileUploadResult> {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path ? `${path}/${fileName}` : fileName;
    const storageRef = ref(getStorage(), filePath);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        name: file.name,
        size: file.size,
        type: file.type,
        fullPath: snapshot.ref.fullPath
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  static async uploadSyllabus(file: File): Promise<FileUploadResult> {
    return this.uploadFile(file, "syllabus");
  }

  static async uploadQuestion(file: File): Promise<FileUploadResult> {
    return this.uploadFile(file, "questions");
  }

  static async listFiles(folder: string): Promise<string[]> {
    const folderRef = ref(getStorage(), folder);
    const result = await listAll(folderRef);
    
    const urls = await Promise.all(
      result.items.map(async (itemRef) => {
        return await getDownloadURL(itemRef);
      })
    );
    
    return urls;
  }

  static async deleteFile(fullPath: string): Promise<void> {
    const fileRef = ref(getStorage(), fullPath);
    await deleteObject(fileRef);
  }

  static async getAllSyllabus(): Promise<string[]> {
    return this.listFiles("syllabus");
  }

  static async getAllQuestions(): Promise<string[]> {
    return this.listFiles("questions");
  }
}
