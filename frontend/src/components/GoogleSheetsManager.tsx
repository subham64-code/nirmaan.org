"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Download, 
  RefreshCw, 
  Upload, 
  Eye,
  Settings,
  Database,
  Users
} from "lucide-react";
import { api } from "@/lib/api";

interface SheetStatus {
  configured: boolean;
  connected?: boolean;
  sheetUrl?: string;
  headers?: string[];
  totalRows?: number;
  lastChecked?: Date;
  error?: string;
  message?: string;
}

interface SheetPreview {
  headers: string[];
  preview: any[];
  totalRows: number;
  validRows: number;
  structureValid: boolean;
}

interface SyncResult {
  syncedCount: number;
  errors: string[];
  totalProcessed: number;
  totalRows: number;
  validRows: number;
}

export default function GoogleSheetsManager() {
  const [sheetStatus, setSheetStatus] = useState<SheetStatus | null>(null);
  const [sheetPreview, setSheetPreview] = useState<SheetPreview | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    checkSheetStatus();
  }, []);

  const checkSheetStatus = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/services/sheet-status");
      setSheetStatus(response.data.data);
    } catch (error: any) {
      setSheetStatus({
        configured: false,
        connected: false,
        error: error.response?.data?.message || "Failed to check sheet status",
        lastChecked: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const previewSheet = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/services/sheet-preview");
      setSheetPreview(response.data.data);
      setSyncResult(null);
    } catch (error: any) {
      showToast("error", "Failed to preview sheet: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const syncSheet = async () => {
    if (!confirm("Are you sure you want to sync attendance data? This will update the database.")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/services/sheet-sync", {});
      setSyncResult(response.data.data);
      // Refresh preview after sync
      await previewSheet();
    } catch (error: any) {
      showToast("error", "Failed to sync sheet: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSampleSheet = () => {
    const csvContent = `Student Name,Date,Status,Email,Phone,Course,Nirmaan ID
John Doe,2024-01-15,Present,john@example.com,+1234567890,AI/ML,NIR2024001
Jane Smith,2024-01-15,Absent,jane@example.com,+1234567891,AI/ML,NIR2024002
Bob Johnson,2024-01-15,Present,bob@example.com,+1234567892,Deep Learning,NIR2024003`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance-sheet-sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = () => {
    if (!sheetStatus) return <RefreshCw className="w-5 h-5 text-gray-500" />;
    
    if (!sheetStatus.configured) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    
    if (sheetStatus.connected === false) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusText = () => {
    if (!sheetStatus) return "Checking status...";
    
    if (!sheetStatus.configured) {
      return "Not configured";
    }
    
    if (sheetStatus.connected === false) {
      return "Connection failed";
    }
    
    return "Connected and ready";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-semibold">Google Sheets Integration</h2>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Toggle settings"
          title="Toggle settings"
          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Status Card */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-medium">Connection Status</h3>
              <p className="text-sm text-gray-600">{getStatusText()}</p>
            </div>
          </div>
          <button
            onClick={checkSheetStatus}
            disabled={isLoading}
            aria-label="Refresh connection status"
            title="Refresh connection status"
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {sheetStatus?.error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{sheetStatus.error}</p>
          </div>
        )}

        {sheetStatus?.configured && sheetStatus.connected !== false && (
          <div className="mt-3 text-sm text-gray-600">
            <p>• Total rows: {sheetStatus.totalRows || 0}</p>
            <p>• Last checked: {sheetStatus.lastChecked?.toLocaleString()}</p>
            {sheetStatus.headers && (
              <p>• Columns: {sheetStatus.headers.join(", ")}</p>
            )}
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Configuration Instructions</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-1">1. Create Google Sheet</h4>
              <p>Create a new Google Sheet with these columns: Student Name, Date, Status, Email, Phone, Course, Nirmaan ID</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">2. Make Sheet Public</h4>
              <p>Share the sheet with "Anyone with the link can view"</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">3. Configure Backend</h4>
              <p>Add this to backend/.env:</p>
              <code className="block bg-blue-100 p-2 rounded mt-1 text-xs">
                GOOGLE_SHEETS_ATTENDANCE_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
              </code>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={downloadSampleSheet}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Sample
              </button>
              <a
                href="https://docs.google.com/spreadsheets/create"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Create New Sheet
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={previewSheet}
          disabled={isLoading || !sheetStatus?.configured}
          className="flex-1 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-5 h-5" />
          {isLoading ? "Loading..." : "Preview Data"}
        </button>
        <button
          onClick={syncSheet}
          disabled={isLoading || !sheetStatus?.configured || !sheetPreview}
          className="flex-1 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Database className="w-5 h-5" />
          {isLoading ? "Syncing..." : "Sync to Database"}
        </button>
      </div>

      {/* Preview Results */}
      {sheetPreview && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            Data Preview
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Rows:</span> {sheetPreview.totalRows}
              </div>
              <div>
                <span className="font-medium">Valid Rows:</span> {sheetPreview.validRows}
              </div>
              <div>
                <span className="font-medium">Columns:</span> {sheetPreview.headers.length}
              </div>
              <div>
                <span className="font-medium">Structure:</span> 
                <span className={`ml-1 ${sheetPreview.structureValid ? 'text-green-600' : 'text-red-600'}`}>
                  {sheetPreview.structureValid ? 'Valid' : 'Invalid'}
                </span>
              </div>
            </div>
          </div>

          {/* Data Table Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3">
              <h4 className="font-medium text-sm">First 5 Rows</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {sheetPreview.headers.map((header, index) => (
                      <th key={index} className="px-4 py-2 text-left font-medium border-b">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheetPreview.preview.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b hover:bg-gray-50">
                      {sheetPreview.headers.map((header, colIndex) => (
                        <td key={colIndex} className="px-4 py-2">
                          {row[header] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sync Results */}
      {syncResult && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Database className="w-5 h-5 text-green-500" />
            Sync Results
          </h3>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
              <div>
                <span className="font-medium">Records Synced:</span> {syncResult.syncedCount}
              </div>
              <div>
                <span className="font-medium">Total Processed:</span> {syncResult.totalProcessed}
              </div>
              <div>
                <span className="font-medium">Errors:</span> {syncResult.errors.length}
              </div>
            </div>

            {syncResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2">Errors:</h4>
                <div className="max-h-32 overflow-y-auto bg-red-50 border border-red-200 rounded p-2">
                  {syncResult.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">
                      • {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {syncResult.syncedCount > 0 && (
              <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded">
                <p className="text-sm text-green-700">
                  ✓ Successfully synced {syncResult.syncedCount} attendance records to the database
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">Quick Help</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Required columns: Student Name, Date, Status</p>
          <p>• Optional columns: Email, Phone, Course, Nirmaan ID</p>
          <p>• Status values: Present, Absent, Late, Excused</p>
          <p>• Date format: YYYY-MM-DD or MM/DD/YYYY</p>
          <p>• Sheet must be publicly accessible</p>
        </div>
      </div>
    </div>
  );
}
