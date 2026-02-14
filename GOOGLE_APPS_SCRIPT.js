// ============================================
// GOOGLE APPS SCRIPT - Salin ke Google Sheet
// ============================================
// 1. Buka Google Sheet Anda
// 2. Tools > Script Editor
// 3. Hapus kode yang ada
// 4. Paste kode ini
// 5. PENTING: Ganti SHEET_ID dan FOLDER_ID dengan data Anda!
// 6. Deploy > New Deployment > Web app
// 7. Copy URL dan ganti SCRIPT_URL di index.html

// ⚠️ PENTING: SHEET_ID harus ID SHEET, bukan URL!
// Contoh: "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t"
// Lihat di URL: https://docs.google.com/spreadsheets/d/[SHEET_ID]/...
const SHEET_ID = "1Z4Y0nbfVsGntFEPiYRKU1_yoW3trMf_9jdr5CWRdYnY"; 

// ⚠️ PENTING: FOLDER_ID harus ID FOLDER Drive yang benar!
// Contoh: "1ZwLIiqHWZUUof8qeOZOiiJ2nYt6_Wia5"
// Lihat di URL: https://drive.google.com/drive/folders/[FOLDER_ID]
const FOLDER_ID = "1ZwLIiqHWZUUof8qeOZOiiJ2nYt6_Wia5";

// Mapping email -> allowed full name (kunci harus lowercase)
// Tambahkan pasangan email: "nama lengkap"
const EMAIL_TO_NAME = {
    "sigit.ramadhan19@gmail.com": "Sigit Ramadhan, S.Pd (Kepala SD Kuttab)"
    // contoh: "nama.email@domain.com": "Nama Lengkap (Jabatan)"
};

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        
        // Validasi SHEET_ID
        if (!SHEET_ID || SHEET_ID.includes("/edit") || SHEET_ID.includes("gid=0")) {
            throw new Error("SHEET_ID tidak valid! Pastikan hanya mengandung ID, bukan URL lengkap");
        }
        
        // Validasi FOLDER_ID
        if (!FOLDER_ID || FOLDER_ID.includes("drive.google.com")) {
            throw new Error("FOLDER_ID tidak valid! Pastikan hanya mengandung ID, bukan URL");
        }
        
        const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
        // PENTING: Ambil sheet pertama (index 0) bukan sheet yang aktif
        // Ini memastikan data selalu ditulis ke sheet yang sama
        const sheet = spreadsheet.getSheets()[0];
        
        if (!sheet) {
            throw new Error("Sheet tidak ditemukan! Pastikan spreadsheet memiliki setidaknya 1 sheet");
        }

        // --- Validasi Email vs Nama (keamanan sisi server) ---
        const incomingEmail = (data.email || '').toString().trim().toLowerCase();
        if (!incomingEmail) {
            throw new Error('Email tidak disertakan dalam permintaan.');
        }
        const registeredName = EMAIL_TO_NAME[incomingEmail];
        if (!registeredName) {
            throw new Error('Email belum terdaftar atau tidak diizinkan. Hubungi admin.');
        }
        if (registeredName !== data.name) {
            throw new Error('Nama tidak sesuai dengan email terdaftar. Terdaftar: ' + registeredName);
        }
        
        Logger.log("Menulis ke sheet: " + sheet.getName());
        
        // Jika ada file, upload ke Drive terlebih dahulu
        let driveLink = "";
        if (data.fileData && data.fileName) {
            Logger.log("Upload file dimulai: " + data.fileName);
            Logger.log("FileData ada: " + (data.fileData ? "Ya" : "Tidak"));
            Logger.log("FileName: " + data.fileName);
            try {
                driveLink = uploadFileToDrive(data.fileData, data.fileName, data.name, data.date);
                Logger.log("Upload berhasil, link: " + driveLink);
            } catch (uploadError) {
                Logger.log("Error saat upload: " + uploadError.toString());
                driveLink = ""; // Reset driveLink jika upload gagal
            }
        } else {
            Logger.log("Tidak ada file untuk di-upload");
            Logger.log("data.fileData: " + (data.fileData ? "Ada" : "Tidak ada"));
            Logger.log("data.fileName: " + data.fileName);
        }
        
        // Jika ada driveLink dan status Sakit, gabungkan ke details
        let finalDetails = data.details;
        if (driveLink && data.status === 'Sakit') {
            // Jika ada file, hanya tampilkan link biru tanpa teks lain
            finalDetails = `=HYPERLINK("${driveLink}", "${data.fileName}")`;
            Logger.log("finalDetails dengan link: " + finalDetails);
        }
        
        // Siapkan data untuk ditulis ke sheet
        // URUTAN: Tanggal, Jam, Nama, Email, Jenis Absen, Status, Keterangan, Pulang Terjadwal, Waktu Submit
        const row = [
            data.date,                 // Tanggal
            data.time,                 // Jam
            data.name,                 // Nama
            incomingEmail,             // Email
            data.type || "-",        // Jenis Absen (Datang/Pulang)
            data.status,               // Status (Hadir/Sakit/Cuti)
            finalDetails,              // Keterangan
            data.scheduledExit || "", // Pulang Terjadwal (hh:mm) - hanya untuk Hadir
            new Date()                 // Waktu Submit
        ];
        
        Logger.log("Data yang akan disimpan: " + JSON.stringify(row));
        Logger.log("Jumlah baris sebelum append: " + sheet.getLastRow());
        
        // Append ke sheet
        sheet.appendRow(row);
        
        Logger.log("Jumlah baris setelah append: " + sheet.getLastRow());
        Logger.log("✅ Data berhasil di-append ke sheet: " + sheet.getName());
        
        return ContentService.createTextOutput(JSON.stringify({
            status: "success",
            message: "Data berhasil tersimpan",
            driveLink: driveLink
        })).setMimeType(ContentService.MimeType.JSON);
        
    } catch (error) {
        Logger.log("Error: " + error.toString());
        return ContentService.createTextOutput(JSON.stringify({
            status: "error",
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

function uploadFileToDrive(fileDataBase64, fileName, employeeName, date) {
    try {
        // Validasi input
        if (!fileDataBase64) {
            throw new Error("fileDataBase64 tidak ada");
        }
        if (!fileName) {
            throw new Error("fileName tidak ada");
        }
        
        Logger.log("Memulai upload dengan fileName: " + fileName);
        
        // Decode Base64 menjadi Blob
        const decodedData = Utilities.base64Decode(fileDataBase64);
        const mimeType = getMimeType(fileName);
        Logger.log("MIME Type untuk " + fileName + ": " + mimeType);
        
        const blob = Utilities.newBlob(decodedData, mimeType, fileName);
        
        // Buat nama folder yang unik (berdasarkan bulan-tahun)
        const now = new Date();
        const monthYear = Utilities.formatDate(now, Session.getScriptTimeZone(), "MMMM_yyyy");
        
        // Cari atau buat folder untuk bulan ini
        const parentFolder = DriveApp.getFolderById(FOLDER_ID);
        let monthFolder = null;
        
        const folders = parentFolder.getFoldersByName(monthYear);
        if (folders.hasNext()) {
            monthFolder = folders.next();
        } else {
            monthFolder = parentFolder.createFolder(monthYear);
        }
        
        // Upload file dengan nama yang deskriptif
        const newFileName = `${date}_${employeeName}_${fileName}`;
        const uploadedFile = monthFolder.createFile(blob).setName(newFileName);
        
        // Return link yang dapat dibagikan
        return uploadedFile.getUrl();
        
    } catch (error) {
        Logger.log("Error uploading file: " + error.toString());
        return "Error: " + error.toString();
    }
}

function getMimeType(fileName) {
    // Validasi fileName
    if (!fileName || typeof fileName !== 'string') {
        Logger.log("Warning: fileName invalid, return default MIME type");
        return 'application/octet-stream';
    }
    
    const extension = fileName.split('.').pop().toLowerCase();
    Logger.log("Extension: " + extension);
    
    const mimeTypes = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    return mimeTypes[extension] || 'application/octet-stream';
}

// ============================================
// INSTRUKSI SETUP:
// ============================================
// 1. SHEET_ID: 
//    Lihat di URL sheet Anda: https://docs.google.com/spreadsheets/d/[SHEET_ID]/...
//
// 2. FOLDER_ID:
//    - Buat folder baru di Google Drive untuk menyimpan surat dokter
//    - Buka folder tersebut
//    - Lihat di URL: https://drive.google.com/drive/folders/[FOLDER_ID]
//
// 3. HEADERS DI SHEET ANDA:
//    A1: Tanggal
//    B1: Jam
//    C1: Nama
//    D1: Tipe
//    E1: Status
//    F1: Keterangan
//    G1: Pulang Terjadwal
//    H1: Waktu Submit
//
// ============================================
