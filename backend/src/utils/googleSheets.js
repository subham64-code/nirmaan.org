const axios = require("axios");
const env = require("../config/env");

async function getAttendanceSheetData() {
  if (!env.googleSheetsAttendanceUrl) {
    throw new Error("Google Sheets URL not configured");
  }

  try {
    // Extract sheet ID from Google Sheets URL
    const sheetId = env.googleSheetsAttendanceUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (!sheetId) {
      throw new Error("Invalid Google Sheets URL format");
    }

    // Extract sheet name (optional, defaults to first sheet)
    const gidMatch = env.googleSheetsAttendanceUrl.match(/[#&]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : "0";

    // Export as CSV
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    
    console.log("Fetching Google Sheets data from:", csvUrl);
    
    const response = await axios.get(csvUrl, {
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.data) {
      throw new Error("No data received from Google Sheets");
    }

    return response.data;
  } catch (error) {
    console.error("Google Sheets fetch error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw new Error(`Failed to fetch Google Sheets: ${error.message}`);
  }
}

async function parseAttendanceData(csvData) {
  if (!csvData || typeof csvData !== 'string') {
    throw new Error("Invalid CSV data");
  }

  try {
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error("Sheet must have at least a header row and one data row");
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length >= headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return { headers, data };
  } catch (error) {
    throw new Error(`Failed to parse CSV data: ${error.message}`);
  }
}

async function validateSheetStructure(data) {
  const requiredColumns = ['Student Name', 'Date', 'Status'];
  const optionalColumns = ['Email', 'Phone', 'Course', 'Nirmaan ID'];
  
  const headers = data.headers.map(h => h.toLowerCase());
  
  // Check for required columns (case-insensitive)
  const missingColumns = requiredColumns.filter(col => 
    !headers.some(h => h.includes(col.toLowerCase()))
  );
  
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }
  
  // Validate data rows
  const validRows = data.data.filter(row => {
    const hasName = Object.values(row).some(val => 
      val && val.trim() && val !== '' && val !== 'NULL' && val !== 'null'
    );
    return hasName;
  });
  
  if (validRows.length === 0) {
    throw new Error("No valid data rows found in the sheet");
  }
  
  return {
    ...data,
    validRows,
    totalRows: data.data.length,
    structureValid: true
  };
}

async function syncAttendanceToDatabase(validatedData) {
  const Attendance = require("../models/Attendance");
  const Student = require("../models/Student");
  
  let syncedCount = 0;
  let errors = [];
  
  for (const row of validatedData.validRows) {
    try {
      // Find student by name or Nirmaan ID
      let student = null;
      
      // Try to find by Nirmaan ID first
      if (row['Nirmaan ID']) {
        student = await Student.findOne({ 
          nirmaanId: row['Nirmaan ID'].trim(),
          role: 'student'
        });
      }
      
      // If not found, try by name
      if (!student && row['Student Name']) {
        student = await Student.findOne({ 
          name: new RegExp(row['Student Name'].trim(), 'i'),
          role: 'student'
        });
      }
      
      if (!student) {
        errors.push(`Student not found: ${row['Student Name'] || row['Nirmaan ID']}`);
        continue;
      }
      
      // Parse date
      let attendanceDate;
      if (row['Date']) {
        attendanceDate = new Date(row['Date']);
        if (isNaN(attendanceDate.getTime())) {
          errors.push(`Invalid date format for ${student.name}: ${row['Date']}`);
          continue;
        }
      } else {
        attendanceDate = new Date();
      }
      
      // Check if attendance already exists
      const existingAttendance = await Attendance.findOne({
        student: student._id,
        date: attendanceDate
      });
      
      if (existingAttendance) {
        // Update existing record
        existingAttendance.status = row['Status'] || 'Present';
        existingAttendance.course = row['Course'] || 'General';
        existingAttendance.markedBy = 'Google Sheets Sync';
        await existingAttendance.save();
        syncedCount++;
      } else {
        // Create new attendance record
        await Attendance.create({
          student: student._id,
          date: attendanceDate,
          status: row['Status'] || 'Present',
          course: row['Course'] || 'General',
          markedBy: 'Google Sheets Sync',
          notes: `Synced from Google Sheets - ${row['Email'] || 'No email'}`
        });
        syncedCount++;
      }
      
    } catch (error) {
      errors.push(`Error processing row for ${row['Student Name']}: ${error.message}`);
    }
  }
  
  return {
    syncedCount,
    errors,
    totalProcessed: validatedData.validRows.length
  };
}

module.exports = { 
  getAttendanceSheetData, 
  parseAttendanceData, 
  validateSheetStructure, 
  syncAttendanceToDatabase 
};
