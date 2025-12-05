"use client";
import { useState, useEffect } from 'react';

// Helper konversi Waktu
const timeToMin = (str) => {
  const [h, m] = str.split(':').map(Number);
  return (h * 60) + m;
};
const minToTime = (min) => {
  const h = Math.floor(min / 60).toString().padStart(2, '0');
  const m = (min % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

export default function BookingPage() {
  const [dataLapangan, setDataLapangan] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(null);

  // Ambil tanggal hari ini (Format YYYY-MM-DD) untuk default
  const todayStr = new Date().toISOString().split('T')[0];

  // State Filter (Untuk melihat jadwal hari tertentu)
  const [filterDate, setFilterDate] = useState(todayStr);

  // State Form
  const [form, setForm] = useState({ 
    nama: '', 
    tanggal: todayStr, // Default hari ini
    mulai: '', 
    selesai: '' 
  });

  // Ambil data berdasarkan Filter Tanggal
  const ambilData = async () => {
    // Kita kirim parameter tanggal ke backend
    const res = await fetch(`/api/status?date=${filterDate}`);
    const data = await res.json();
    setDataLapangan(data);
  };

  // useEffect: Ambil data saat halaman dibuka ATAU saat filter tanggal diganti
  useEffect(() => {
    ambilData();
    const interval = setInterval(ambilData, 5000); // Auto refresh
    return () => clearInterval(interval);
  }, [filterDate]); //! Refresh kalau tanggal diganti

  const handleLogin = () => {
    if (prompt("Password Admin:") === "admin123") {
      setIsAdmin(true);
      alert("✅ Mode Admin Aktif");
    } else {
      alert("❌ Salah sandi");
    }
  };

  const simpanBooking = async (e) => {
    e.preventDefault();
    if(!form.nama || !form.tanggal || !form.mulai || !form.selesai) return alert("Lengkapi data!");

    const mStart = timeToMin(form.mulai);
    const mEnd = timeToMin(form.selesai);
    if (mEnd <= mStart) return alert("Jam selesai salah!");
    if (isEditing && !isAdmin) return alert("Harus Login Admin!");

    const method = isEditing ? 'PUT' : 'POST';
    const body = { ...form, mulai: mStart, selesai: mEnd, id: isEditing };

    const res = await fetch('/api/status', {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const hasil = await res.json();
    if (!res.ok) {
      alert("GAGAL: " + hasil.error);
    } else {
      alert(isEditing ? "✅ Update Sukses" : "✅ Booking Sukses");
      setForm({ nama: '', tanggal: todayStr, mulai: '', selesai: '' });
      setIsEditing(null);
      ambilData();
    }
  };

  const hapusBooking = async (id) => {
    if (!confirm("Hapus?")) return;
    await fetch('/api/status', { method: 'DELETE', body: JSON.stringify({ id }) });
    ambilData();
  };

  const klikEdit = (l) => {
    setIsEditing(l.id);
    setForm({
      nama: l.nama_lapangan,
      tanggal: l.tanggal,
      mulai: minToTime(l.jam_mulai),
      selesai: minToTime(l.jam_selesai)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={styles.container}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
        <h1 style={styles.header}>📅 Sistem Jadwal</h1>
        <button onClick={() => isAdmin ? setIsAdmin(false) : handleLogin()} style={isAdmin ? styles.logoutBtn : styles.loginBtn}>
          {isAdmin ? '🚪 Logout' : '🔐 Admin'}
        </button>
      </div>

      {/* --- FORMULIR --- */}
      <div style={{...styles.card, border: isEditing ? '2px solid #f39c12' : 'none'}}>
        <h3 style={styles.cardTitle}>{isEditing ? '✏️ Edit Mode' : '➕ Booking Baru'}</h3>
        <form onSubmit={simpanBooking} style={styles.form}>
          <input type="text" placeholder="Nama Tim" value={form.nama} onChange={e=>setForm({...form, nama:e.target.value})} style={styles.input} />
          
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Tanggal Main</label>
              {/* INPUT TANGGAL */}
              <input type="date" value={form.tanggal} onChange={e=>setForm({...form, tanggal:e.target.value})} style={styles.input} />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Mulai</label>
              <input type="time" value={form.mulai} onChange={e=>setForm({...form, mulai:e.target.value})} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Selesai</label>
              <input type="time" value={form.selesai} onChange={e=>setForm({...form, selesai:e.target.value})} style={styles.input} />
            </div>
          </div>
          <button type="submit" style={{...styles.button, background: isEditing ? '#f39c12' : '#2563eb'}}>Simpan</button>
        </form>
      </div>

      {/* --- FILTER & DAFTAR --- */}
      <div style={{marginBottom: '20px', textAlign:'center'}}>
        <label style={{fontWeight:'bold', marginRight:'10px'}}>Lihat Jadwal Tanggal:</label>
        {/* FILTER JADWAL */}
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{padding:'8px', borderRadius:'5px', border:'1px solid #ccc'}} />
      </div>

      <div style={styles.listContainer}>
        {dataLapangan.length === 0 ? <p style={{textAlign:'center', color:'#888'}}>Tidak ada jadwal di tanggal ini.</p> : 
          dataLapangan.map((l) => (
            <div key={l.id} style={{...styles.statusCard, opacity: l.status === 'SELESAI' ? 0.6 : 1}}>
              <div>
                <h3 style={styles.lapanganName}>{l.nama_lapangan}</h3>
                <p style={styles.lapanganTime}>📅 {l.tanggal} | 🕒 {minToTime(l.jam_mulai)} - {minToTime(l.jam_selesai)}</p>
                <span style={{...styles.badge, 
                    backgroundColor: l.warna === 'red' ? '#ffebeb' : (l.warna === 'gray' ? '#eee' : '#e6fffa'),
                    color: l.warna === 'red' ? '#c0392b' : (l.warna === 'gray' ? '#777' : '#27ae60'),
                    border: '1px solid currentColor'
                }}>
                  {l.status}
                </span>
              </div>
              {isAdmin && (
                <div style={{display:'flex', gap:'5px'}}>
                  <button onClick={()=>klikEdit(l)} style={styles.editButton}>Edit</button>
                  <button onClick={()=>hapusBooking(l.id)} style={styles.deleteButton}>Hapus</button>
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '40px auto', padding: '20px' },
  header: { margin: 0, color: '#1e293b', fontSize: '24px' },
  loginBtn: { padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' },
  logoutBtn: { padding: '8px 16px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' },
  cardTitle: { marginTop: 0, marginBottom: '15px', color: '#334155' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  row: { display: 'flex', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', flex: 1 },
  label: { marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#64748b' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px' },
  button: { padding: '12px', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  statusCard: { backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  lapanganName: { margin: '0 0 5px 0', color: '#1e293b', fontSize: '16px' },
  lapanganTime: { margin: 0, color: '#64748b', fontSize: '13px' },
  badge: { padding: '3px 10px', borderRadius: '15px', fontWeight: 'bold', fontSize: '11px', display:'inline-block', marginTop:'5px' },
  editButton: { backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize:'12px' },
  deleteButton: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize:'12px' }
};