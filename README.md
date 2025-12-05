# ⚽ Sewa Lapangan — Booking Lapangan Sepak Bola

Aplikasi web untuk manajemen pemesanan jadwal lapangan sepak bola/futsal. Dibangun menggunakan **Next.js (App Router)** dengan fitur status jadwal *real-time* yang otomatis berubah mengikuti waktu server (WIB).

Sistem ini memudahkan pengguna melihat jadwal kosong, mendeteksi bentrok jadwal secara otomatis, dan memantau status lapangan yang sedang digunakan.

---

## 🚀 Fitur Utama

- 🏟️ **Booking Online**: Input nama tim, tanggal, dan jam main.
- ⚡ **Status Real-time**: Label status otomatis berubah tanpa refresh manual:
  - 🟡 **MENUNGGU ACC**: Saat baru booking (status pending).
  - 🟢 **BOOKED**: Jadwal terkonfirmasi (belum mulai).
  - 🔴 **SEDANG MAIN**: Saat jam sekarang masuk dalam rentang jadwal main (animasi & warna berubah).
  - ⚫ **SELESAI**: Saat jam main sudah lewat.
- 🛡️ **Cek Bentrok Otomatis**: Mencegah pemesanan ganda di jam yang sama.
- 🕒 **Timezone Aware**: Mendukung zona waktu **Asia/Jakarta (WIB)** secara akurat.
- 📱 **Responsive UI**: Tampilan rapi di desktop maupun mobile.

---

## 🧱 Teknologi yang Digunakan

| Teknologi | Kegunaan |
|----------|-----------|
| **Next.js 14+** | Framework Fullstack (App Router) |
| **React** | Library UI Frontend |
| **Tailwind CSS** | Styling modern & responsif |
| **SQLite** | Database ringan & cepat |
| **better-sqlite3** | Driver database untuk performa tinggi |

---

## 📁 Struktur Proyek

```text
📦 sewa-lapangan
├─ 📂 app
│  ├─ 📂 api
│  │  └─ 📂 status     # API logic (CRUD & Realtime Status)
│  ├─ 📂 booking       # Halaman form booking
│  ├─ 📜 globals.css   # Global styles (Tailwind directives)
│  ├─ 📜 layout.js     # Layout utama aplikasi
│  └─ 📜 page.js       # Halaman utama (Dashboard Jadwal)
├─ 📂 public           # Aset statis (favicon, images)
├─ 📜 lapangan.db      # File Database SQLite (otomatis terupdate)
├─ 📜 setup-db.js      # Script untuk inisialisasi tabel database
├─ 📜 package.json     # Daftar dependency project
└─ 📜 README.md        # Dokumentasi project
```

▶️ Cara Menjalankan Project

Pastikan sudah menginstall Node.js minimal versi 18+.
1. Clone repository ini

```git clone [https://github.com/R4fii/sewa-lapangan](https://github.com/R4fii/sewa-lapangan)```

```cd sewa-lapangan```

2. Install dependency
```npm install```

3. Jalankan Aplikasi
```npm run dev```

4. Buka di Browser Akses http://localhost:3000 untuk melihat aplikasi.

📝 Roadmap & Todo

- [x] Sistem Booking Dasar (CRUD)

- [x] Validasi Jadwal Bentrok

- [x] Status Visual Real-time (Booked vs Main)

- [ ] Dashboard Admin (Approve/Reject Booking)

- [ ] Sistem Login & Autentikasi

- [ ] Integrasi Pembayaran (Payment Gateway)

🤝 Kontribusi

Kontribusi terbuka buat siapa aja. Silakan fork, buat branch baru, lalu kirim pull request.

📄 Lisensi

Project ini dirilis menggunakan lisensi MIT — bebas dipakai, dimodifikasi, dan dikembangkan.

💬 Kontak

Punya ide atau mau kolaborasi? 👉 GitHub Issues atau Pull Request.