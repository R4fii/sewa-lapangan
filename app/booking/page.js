"use client";
import { useState, useEffect } from 'react';

// --- HELPER KONVERSI ---
// Mengubah "14:30" menjadi 870 (total menit)
const timeToMin = (str) => {
  const [h, m] = str.split(':').map(Number);
  return (h * 60) + m;
};

// Mengubah 870 menjadi "14:30" (untuk ditampilkan kembali di form)
const minToTime = (min) => {
  const h = Math.floor(min / 60).toString().padStart(2, '0');
  const m = (min % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

export default function Home() {
  const [dataLapangan, setDataLapangan] = useState([]);
  const [isEditing, setIsEditing] = useState(null); // Menyimpan ID yang sedang diedit

  // State Form (Default string kosong untuk input type="time")
  const [form, setForm] = useState({ nama: '', mulai: '', selesai: '' });

  const ambilData = async () => {
    const res = await fetch('/api/status');
    const data = await res.json();
    setDataLapangan(data);
  };

  useEffect(() => {
    ambilData();
    const interval = setInterval(ambilData, 5000); // Cek tiap 5 detik
    return () => clearInterval(interval);
  }, []);

  // --- LOGIKA SIMPAN (Bisa Buat Baru atau Update) ---
  const simpanBooking = async (e) => {
    e.preventDefault();
    if(!form.nama || !form.mulai || !form.selesai) return alert("Lengkapi data!");

    const mStart = timeToMin(form.mulai);
    const mEnd = timeToMin(form.selesai);

    if (mEnd <= mStart) return alert("Jam Selesai harus lebih akhir dari Jam Mulai!");

    // Tentukan mau CREATE (POST) atau EDIT (PUT)
    const method = isEditing ? 'PUT' : 'POST';
    const body = { nama: form.nama, mulai: mStart, selesai: mEnd, id: isEditing };

    const res = await fetch('/api/status', {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const hasil = await res.json();

    if (!res.ok) {
      alert("GAGAL: " + hasil.error); // Muncul jika bentrok
    } else {
      alert(isEditing ? "✅ Jadwal Diupdate!" : "✅ Booking Berhasil!");
      resetForm();
      ambilData();
    }
  };

  // Fungsi Reset Form
  const resetForm = () => {
    setForm({ nama: '', mulai: '', selesai: '' });
    setIsEditing(null);
  };

  // Fungsi Klik Tombol Edit
  const klikEdit = (lapangan) => {
    setIsEditing(lapangan.id);
    setForm({
      nama: lapangan.nama_lapangan, // Sesuai nama kolom DB
      mulai: minToTime(lapangan.jam_mulai),
      selesai: minToTime(lapangan.jam_selesai)
    });
    // Scroll ke atas (ke form)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hapusBooking = async (id) => {
    if (!confirm("Hapus jadwal ini?")) return;
    await fetch('/api/status', { method: 'DELETE', body: JSON.stringify({ id }) });
    ambilData();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>⚽ Manajemen Lapangan Pro</h1>

      {/* --- FORMULIR --- */}
      <div style={{...styles.card, border: isEditing ? '2px solid #f39c12' : 'none'}}>
        <div style={{display:'flex', justifyContent:'space-between'}}>
            <h3 style={styles.cardTitle}>{isEditing ? '✏️ Edit Jadwal' : '➕ Booking Baru'}</h3>
            {isEditing && <button onClick={resetForm} style={styles.cancelBtn}>Batal Edit</button>}
        </div>
        
        <form onSubmit={simpanBooking} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nama Tim</label>
            <input type="text" placeholder="Nama Tim..." value={form.nama} onChange={(e) => setForm({...form, nama: e.target.value})} style={styles.input} />
          </div>
          
          <div style={styles.row}>
            {/* INPUT TIME HTML5 (Bisa pilih menit!) */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Mulai</label>
              <input type="time" value={form.mulai} onChange={(e) => setForm({...form, mulai: e.target.value})} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Selesai</label>
              <input type="time" value={form.selesai} onChange={(e) => setForm({...form, selesai: e.target.value})} style={styles.input} />
            </div>
          </div>

          <button type="submit" style={{...styles.button, background: isEditing ? '#f39c12' : '#2563eb'}}>
            {isEditing ? 'Update Perubahan' : 'Simpan Jadwal'}
          </button>
        </form>
      </div>

      {/* --- DAFTAR --- */}
      <div style={styles.listContainer}>
        {dataLapangan.map((l) => (
          <div key={l.id} style={styles.statusCard}>
            <div>
              <h3 style={styles.lapanganName}>{l.nama_lapangan}</h3>
              <p style={styles.lapanganTime}>
                🕒 {minToTime(l.jam_mulai)} - {minToTime(l.jam_selesai)}
              </p>
              <span style={{...styles.badge, 
                  backgroundColor: l.warna === 'red' ? '#ffebeb' : '#e6fffa',
                  color: l.warna === 'red' ? '#c0392b' : '#27ae60'
              }}>
                {l.status}
              </span>
            </div>
            
            <div style={{display:'flex', gap:'8px'}}>
              <button onClick={() => klikEdit(l)} style={styles.editButton}>Edit</button>
              <button onClick={() => hapusBooking(l.id)} style={styles.deleteButton}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '40px auto', padding: '20px' },
  header: { textAlign: 'center', marginBottom: '30px', color: '#1e293b' },
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' },
  cardTitle: { marginTop: 0, marginBottom: '20px', color: '#334155' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  row: { display: 'flex', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', flex: 1 },
  label: { marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#64748b' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' },
  button: { padding: '12px', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  cancelBtn: { background:'transparent', border:'none', color:'#e74c3c', cursor:'pointer', fontWeight:'bold'},
  listContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  statusCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  lapanganName: { margin: '0 0 5px 0', color: '#1e293b', fontSize: '16px' },
  lapanganTime: { margin: 0, color: '#64748b', fontSize: '14px' },
  badge: { padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px', display:'inline-block', marginTop:'8px' },
  editButton: { backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold', fontSize:'12px' },
  deleteButton: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold', fontSize:'12px' }
};