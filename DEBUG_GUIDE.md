# 🔍 Panduan Debug - Data Tidak Muncul di Sheet

## Masalah
- ✅ Executions di Google Apps Script menunjukkan "success"
- ❌ Data tidak muncul di Google Sheet

---

## Solusi Langkah demi Langkah

### **Step 1: Update Google Apps Script dengan kode terbaru**
1. Buka Google Sheet Anda
2. Klik **Tools > Script Editor**
3. Hapus semua kode lama
4. Copy-paste **SELURUH kode** dari file `GOOGLE_APPS_SCRIPT.js`
5. Klik **Deploy > Update**

### **Step 2: Lihat Execution Logs**
1. Di Script Editor, klik **Executions** (icon jam pasir di kiri)
2. Cari execution terakhir (paling atas)
3. Klik execution tersebut untuk lihat detailnya
4. Cari log yang berbunyi:
   - ✅ `"Menulis ke sheet: [NAMA_SHEET]"` - Ini sheet yang mana?
   - ✅ `"Data yang akan disimpan: {...}"` - Data apa yang dikirim?
   - ✅ `"Jumlah baris sebelum append: X"` - Berapa baris sebelumnya?
   - ✅ `"Jumlah baris setelah append: Y"` - Bertambah ke berapa?

### **Step 3: Cek Sheet yang Benar**
1. Di Google Sheet, lihat **tab sheet** di bawah
2. Pastikan Anda membuka **sheet pertama** (biasanya bernama "Sheet1" atau nama default lainnya)
3. **PENTING**: Data akan ditulis ke sheet PERTAMA, bukan sheet yang sedang aktif!

### **Step 4: Cek Filter/Hide Rows**
1. Klik menu **Data > Create a filter** untuk melihat apakah ada filter aktif
2. Jika ada filter, matikan untuk memastikan semua baris terlihat
3. Cek apakah ada baris yang hidden dengan cara:
   - Select semua baris
   - Klik kanan > **Unhide rows**

### **Step 5: Cek Headers**
Pastikan row pertama (row 1) memiliki headers:
- A1: Nama
- B1: Tanggal
- C1: Jam
- D1: Tipe
- E1: Status
- F1: Keterangan
- G1: Waktu Submit

Jika tidak ada headers, data mungkin ditulis di bawahnya dan tidak terlihat.

### **Step 6: Refresh Browser & Sheet**
1. Refresh Google Sheet: `Ctrl+R` (Windows) atau `Cmd+R` (Mac)
2. Refresh Browser aplikasi: `Ctrl+R` atau `Cmd+R`
3. Coba submit absensi lagi

---

## ⚠️ Troubleshooting Umum

### Problem: "Data yang akan disimpan: [Array kosong]"
**Penyebab**: Data dari form tidak terkirim dengan benar
**Solusi**: Cek index.html apakah form benar-benar mengirim data

### Problem: "FOLDER_ID tidak valid"
**Penyebab**: FOLDER_ID masih mengandung URL lengkap
**Solusi**: Pastikan FOLDER_ID hanya berisi ID, contoh: `1ZwLIiqHWZUUof8qeOZOiiJ2nYt6_Wia5`

### Problem: "Sheet tidak ditemukan"
**Penyebab**: SHEET_ID salah atau spreadsheet tidak memiliki sheet
**Solusi**: 
1. Verifikasi SHEET_ID dari URL sheet: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/...`
2. Pastikan spreadsheet minimal memiliki 1 sheet

### Problem: Baris bertambah tapi kolom F (Keterangan) kosong
**Penyebab**: finalDetails = "-" karena tidak ada file atau belum di-set
**Solusi**: Cek apakah status sakit dan ada file sudah ter-upload

---

## 📋 Checklist Final

Sebelum coba lagi, pastikan:
- [ ] Google Apps Script sudah di-UPDATE dengan kode terbaru
- [ ] SHEET_ID benar (hanya ID, tidak ada /edit)
- [ ] FOLDER_ID benar (hanya ID)
- [ ] Sheet pertama memiliki headers di row 1
- [ ] Tidak ada filter aktif di sheet
- [ ] Browser dan Google Sheet sudah di-refresh
- [ ] Cek execution logs untuk melihat apa yang terjadi

---

## 🆘 Jika Masih Tidak Berhasil

Kirimkan screenshot dari:
1. Execution logs di Script Editor (terutama log messages)
2. Headers yang ada di sheet Anda (row 1)
3. Error message di browser console (F12)
