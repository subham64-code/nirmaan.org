"use client";

import GoogleSheetsManager from "@/components/GoogleSheetsManager";
import { FileSpreadsheet, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GoogleSheetsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/admin"
          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-green-500" />
          <div>
            <h1 className="text-3xl font-bold">Google Sheets Management</h1>
            <p className="text-gray-600">Sync attendance data from Google Sheets to database</p>
          </div>
        </div>
      </div>

      <GoogleSheetsManager />
    </div>
  );
}
