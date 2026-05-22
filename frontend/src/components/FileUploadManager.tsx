"use client";

import { useState, useRef } from "react";
import { useToast } from "@/components/ToastProvider";
import { StorageService, FileUploadResult } from "@/lib/storage";
import { Upload, File, Trash2, Download, Eye } from "lucide-react";

interface UploadedFile extends FileUploadResult {
  id: string;
  uploadDate: Date;
}

export default function FileUploadManager() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<"syllabus" | "questions">("syllabus");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showToast = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let result: FileUploadResult;
      if (uploadType === "syllabus") {
        result = await StorageService.uploadSyllabus(file);
      } else {
        result = await StorageService.uploadQuestion(file);
      }

      const newFile: UploadedFile = {
        ...result,
        id: Date.now().toString(),
        uploadDate: new Date()
      };

      setUploadedFiles(prev => [...prev, newFile]);
    } catch (error) {
      console.error("Upload failed:", error);
      showToast("error", "File upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    try {
      await StorageService.deleteFile(file.fullPath);
      setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("error", "Failed to delete file. Please try again.");
    }
  };

  const handleDownload = (file: UploadedFile) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (file: UploadedFile) => {
    window.open(file.url, "_blank");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">File Upload Manager</h3>
      
      {/* Upload Type Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setUploadType("syllabus")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            uploadType === "syllabus"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Syllabus
        </button>
        <button
          onClick={() => setUploadType("questions")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            uploadType === "questions"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Questions
        </button>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".doc,.docx,.pdf,.txt"
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex flex-col items-center"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-gray-600 mb-1">
            Click to upload {uploadType === "syllabus" ? "syllabus" : "question"} files
          </span>
          <span className="text-sm text-gray-500">
            Supported formats: DOC, DOCX, PDF, TXT
          </span>
        </label>
        {isUploading && (
          <div className="mt-4">
            <div className="inline-flex items-center gap-2 text-blue-500">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </div>
          </div>
        )}
      </div>

      {/* Files List */}
      {uploadedFiles.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Uploaded {uploadType === "syllabus" ? "Syllabi" : "Questions"}</h4>
          <div className="space-y-2">
            {uploadedFiles
              .filter(file => 
                uploadType === "syllabus" 
                  ? file.fullPath.startsWith("syllabus/")
                  : file.fullPath.startsWith("questions/")
              )
              .map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • 
                        {file.uploadDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePreview(file)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(file)}
                      className="p-2 text-green-500 hover:bg-green-50 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {uploadedFiles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No {uploadType} files uploaded yet</p>
        </div>
      )}
    </div>
  );
}
