# Panduan Deploy OSIS VOTE ke Vercel (vercel.app)

Aplikasi **OSIS VOTE** ini dibuat dengan arsitektur **Vite + React + Tailwind CSS**, siap di-onlinekan dan di-*deploy* ke **Vercel** secara gratis.

File konfigurasi `vercel.json` telah dibuat di direktori utama (*root*) proyek untuk memastikan *routing SPA (Single Page Application)* dan *caching asset* berjalan mulus tanpa masalah 404 saat *refresh* halaman.

---

## 🚀 Cara 1: Deploy Lewat Dashboard Vercel (Paling Mudah & Direkomendasikan)

1. **Unggah Proyek ke GitHub**:
   - Buat repositori baru di akun [GitHub](https://github.com).
   - Push seluruh file kode proyek ini ke repositori tersebut.

2. **Buka Vercel**:
   - Kunjungi [https://vercel.com](https://vercel.com) dan login (bisa login langsung dengan akun GitHub).
   - Di dashboard Vercel, klik tombol **"Add New..."** lalu pilih **"Project"**.

3. **Impor Repositori**:
   - Cari dan pilih repositori GitHub proyek OSIS VOTE Anda, lalu klik **"Import"**.

4. **Konfigurasi Project Settings**:
   - **Framework Preset**: Vercel akan otomatis mendeteksi **Vite**.
   - **Build Command**: `npm run build` (atau otomatis sesuai `vercel.json`).
   - **Output Directory**: `dist` (otomatis sesuai `vercel.json`).

5. **(Opsional) Environment Variables di Vercel**:
   Jika Anda memiliki database Supabase sendiri, tambahkan variabel di menu *Environment Variables*:
   - `VITE_SUPABASE_URL` = URL proyek Supabase Anda
   - `VITE_SUPABASE_ANON_KEY` = Kunci Anon/Public Supabase Anda
   *(Jika dikosongkan, sistem tetap berjalan menggunakan konfigurasi database default).*

6. **Deploy**:
   - Klik tombol **"Deploy"**.
   - Tunggu sekitar 30 - 60 detik hingga proses build selesai.
   - Aplikasi Anda langsung online di alamat:  
     `https://nama-proyek-anda.vercel.app` 🎉

---

## 💻 Cara 2: Deploy Menggunakan Vercel CLI (Lewat Terminal / Komputer)

Jika Anda menyukai terminal / command-line:

1. Pastikan Anda telah menginstal Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Jalankan perintah login:
   ```bash
   vercel login
   ```

3. Jalankan perintah deploy di folder proyek:
   ```bash
   vercel --prod
   ```

4. Ikuti instruksi di layar (pilih `Y` untuk *default settings*). Vercel akan membaca file `vercel.json` dan memberikan URL publik `vercel.app` Anda secara instan.

---

## ⚙️ Rincian File `vercel.json` yang Disediakan

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

- **`rewrites`**: Mengarahkan seluruh URL ke `/index.html` agar navigasi SPA (Halaman Beranda, Login NISN, Bilik Suara, Real Count, Dashboard Admin) tidak *error 404* saat siswa me-refresh browser.
- **`headers`**: Mengoptimalkan kecepatan akses dan performa *caching* aset gambar, CSS, dan skrip JavaScript di CDN global Vercel.
