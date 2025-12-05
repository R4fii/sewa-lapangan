"use client";
import { useState, useEffect } from 'react';

// --- HELPER UTILS ---
const timeToMin = (str) => {
  if (!str) return 0;
  const [h, m] = str.split(':').map(Number);
  return (h * 60) + m;
};

const minToTime = (min) => {
  let h = Math.floor(min / 60);
  if (h >= 24) h = h - 24; // Reset jam jika lebih dari 24 (misal 25:00 jadi 01:00)
  const m = (min % 60).toString().padStart(2, '0');
  return `${h.toString().padStart(2, '0')}:${m}`;
};

const formatDateIndo = (dateStr) => {
  if (!dateStr) return '';
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('id-ID', options);
};

// --- KOMPONEN INPUT JAM CUSTOM (Supaya Pasti 24 Jam) ---
const TimeSelector = ({ label, value, onChange }) => {
  // Generate Jam 00 - 23
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  // Generate Menit 00 - 55 (Interval 5 menit biar gak kebanyakan scroll)
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  const [currentH, currentM] = value ? value.split(':') : ['00', '00'];

  const handleHChange = (e) => onChange(`${e.target.value}:${currentM}`);
  const handleMChange = (e) => onChange(`${currentH}:${e.target.value}`);

  return (
    <div>
      <label style={styles.label}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {/* Dropdown JAM */}
        <select value={currentH} onChange={handleHChange} style={styles.timeSelect}>
          {hours.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        
        <span style={{fontWeight:'bold'}}>:</span>
        
        {/* Dropdown MENIT */}
        <select value={currentM} onChange={handleMChange} style={styles.timeSelect}>
          {minutes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
    </div>
  );
};

export default function BookingPage() {
  const [dataLapangan, setDataLapangan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const todayStr = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState(todayStr);

  // Default jam mulai 08:00, selesai 09:00 biar user gak bingung
  const [form, setForm] = useState({ 
    nama: '', 
    tanggal: todayStr, 
    mulai: '08:00', 
    selesai: '09:00' 
  });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3000);
  };

  const ambilData = async () => {
    const res = await fetch(`/api/status?date=${filterDate}`);
    const data = await res.json();
    setDataLapangan(data);
    setIsLoading(false);
  };

  useEffect(() => {
    ambilData();
    const interval = setInterval(ambilData, 5000);
    return () => clearInterval(interval);
  }, [filterDate]);

  const handleLogin = () => {
    const pass = prompt("🔑 Masukkan Password Admin:"); 
    // Password sesuai kodemu sebelumnya
    if (pass === "adminsatuduatiga") {
      setIsAdmin(true);
      showToast("Selamat datang Admin!", "success");
    } else {
      if(pass) showToast("Password salah!", "error");
    }
  };

  // --- BAGIAN INI YANG DIPERBAIKI (LOGIKA LINTAS HARI) ---
  const simpanBooking = async (e) => {
    e.preventDefault();
    if(!form.nama || !form.tanggal) return showToast("Nama & Tanggal wajib diisi!", "error");

    const mStart = timeToMin(form.mulai);
    let mEnd = timeToMin(form.selesai); // Ubah jadi let biar bisa diedit
    
    // Validasi Logika Jam (Support Lintas Hari / Overnight)
    // Jika Selesai lebih kecil dari Mulai (misal 01:00 < 23:00), berarti besoknya (+1440 menit)
    if (mEnd < mStart) {
      mEnd += 1440; 
    }
    
    // Cek durasi 0 menit (misal 14:00 - 14:00)
    if (mEnd === mStart) return showToast("Durasi main minimal 5 menit!", "error");

    if (isEditing && !isAdmin) return showToast("Harus Login Admin untuk edit!", "error");

    const method = isEditing ? 'PUT' : 'POST';
    const body = { ...form, mulai: mStart, selesai: mEnd, id: isEditing };

    try {
      const res = await fetch('/api/status', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const hasil = await res.json();
      
      if (!res.ok) throw new Error(hasil.error);

      showToast(isEditing ? "Jadwal diupdate!" : "Booking berhasil!", "success");
      setForm({ nama: '', tanggal: todayStr, mulai: '08:00', selesai: '09:00' });
      setIsEditing(null);
      ambilData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const hapusBooking = async (id) => {
    if (!confirm("Hapus jadwal ini?")) return;
    await fetch('/api/status', { method: 'DELETE', body: JSON.stringify({ id }) });
    showToast("Jadwal dihapus.", "success");
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
      
      {toast.show && (
        <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981'}}>
          {toast.type === 'error' ? '⚠️ ' : '✅ '} {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>⚽ Booking Arena</h1>
          <p style={styles.subtitle}>Silakan Booking,</p>
        </div>
        <button 
          onClick={() => isAdmin ? setIsAdmin(false) : handleLogin()} 
          style={isAdmin ? styles.btnOutlineRed : styles.btnOutline}
        >
          {isAdmin ? 'Logout' : 'Admin'}
        </button>
      </div>

      {/* FORM CARD */}
      <div style={{...styles.card, borderTop: isEditing ? '4px solid #f59e0b' : '4px solid #3b82f6'}}>
        <h3 style={styles.cardHeader}>{isEditing ? '✏️ Edit Mode' : '📝 Buat Jadwal Baru'}</h3>
        
        <form onSubmit={simpanBooking} style={styles.formGrid}>
          <div style={styles.fullWidth}>
            <label style={styles.label}>Nama Tim</label>
            <input type="text" placeholder="Nama Tim..." value={form.nama} onChange={e=>setForm({...form, nama:e.target.value})} style={styles.input} />
          </div>

          <div style={styles.fullWidth}>
            <label style={styles.label}>Tanggal Main</label>
            <input type="date" value={form.tanggal} onChange={e=>setForm({...form, tanggal:e.target.value})} style={styles.input} />
          </div>

          {/* --- INPUT JAM CUSTOM (24 JAM) --- */}
          <TimeSelector 
            label="Jam Mulai" 
            value={form.mulai} 
            onChange={(val) => setForm({...form, mulai: val})} 
          />
          
          <TimeSelector 
            label="Jam Selesai" 
            value={form.selesai} 
            onChange={(val) => setForm({...form, selesai: val})} 
          />
          {/* --------------------------------- */}

          <div style={styles.fullWidth}>
            <button type="submit" style={isEditing ? styles.btnWarning : styles.btnPrimary}>
              {isEditing ? 'Simpan Perubahan' : 'Booking Sekarang'}
            </button>
            {isEditing && <button type="button" onClick={()=>{setIsEditing(null); setForm({...form, nama:'', mulai:'08:00', selesai:'09:00'})}} style={styles.btnLink}>Batal</button>}
          </div>
        </form>
      </div>

      {/* DAFTAR JADWAL */}
      <div style={styles.scheduleSection}>
        <div style={styles.filterRow}>
          <h3 style={styles.sectionTitle}>Jadwal: {formatDateIndo(filterDate)}</h3>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={styles.inputSmall} />
        </div>

        {isLoading ? (
          <div style={styles.loadingState}><div style={styles.spinner}></div> Memuat...</div>
        ) : (
          <div style={styles.gridContainer}>
            {dataLapangan.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{fontSize: '40px'}}>🍃</div>
                <p>Jadwal Kosong</p>
              </div>
            ) : (
              dataLapangan.map((l) => (
                <div key={l.id} style={{
                  ...styles.ticketCard, 
                  borderLeft: `5px solid ${l.warna === 'red' ? '#ef4444' : (l.warna === 'gray' ? '#cbd5e1' : '#10b981')}`,
                  opacity: l.status === 'SELESAI' ? 0.6 : 1
                }}>
                  <div style={styles.ticketContent}>
                    <div style={styles.ticketTime}>
                      {minToTime(l.jam_mulai)} - {minToTime(l.jam_selesai)}
                    </div>
                    <div style={styles.ticketName}>{l.nama_lapangan}</div>
                    <div style={{
                      ...styles.statusBadge,
                      color: l.warna === 'red' ? '#ef4444' : (l.warna === 'gray' ? '#64748b' : '#10b981'),
                      backgroundColor: l.warna === 'red' ? '#fef2f2' : (l.warna === 'gray' ? '#f1f5f9' : '#ecfdf5'),
                    }}>
                      {l.status}
                    </div>
                  </div>

                  {isAdmin && (
                    <div style={styles.adminActions}>
                      <button onClick={()=>klikEdit(l)} style={styles.iconBtn}>✏️</button>
                      <button onClick={()=>hapusBooking(l.id)} style={styles.iconBtnDel}>🗑️</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '20px', animation: 'fadeIn 0.5s ease-out' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', margin: '5px 0 0 0' },
  
  btnPrimary: { width: '100%', padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' },
  btnWarning: { width: '100%', padding: '14px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' },
  btnOutline: { padding: '8px 16px', backgroundColor: 'transparent', border: '2px solid #e2e8f0', borderRadius: '30px', fontWeight: '600', color: '#475569', cursor: 'pointer' },
  btnOutlineRed: { padding: '8px 16px', backgroundColor: '#fef2f2', border: '2px solid #fecaca', borderRadius: '30px', fontWeight: '600', color: '#ef4444', cursor: 'pointer' },
  btnLink: { background: 'none', border: 'none', color: '#64748b', marginTop: '10px', cursor: 'pointer', textDecoration: 'underline', width: '100%' },

  card: { backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', marginBottom: '40px' },
  cardHeader: { margin: '0 0 20px 0', fontSize: '18px', color: '#334155' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  fullWidth: { gridColumn: '1 / -1' },
  
  label: { display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none', backgroundColor: '#f8fafc' },
  
  // Style khusus untuk Time Picker Custom
  timeSelect: { 
    flex: 1, 
    padding: '12px', 
    borderRadius: '10px', 
    border: '1px solid #cbd5e1', 
    fontSize: '16px', 
    backgroundColor: '#f8fafc', 
    outline: 'none',
    cursor: 'pointer',
    textAlign: 'center'
  },

  scheduleSection: { borderTop: '1px solid #e2e8f0', paddingTop: '30px' },
  filterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { margin: 0, fontSize: '18px', color: '#1e293b' },
  inputSmall: { padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' },
  
  gridContainer: { display: 'grid', gridTemplateColumns: '1fr', gap: '12px' },
  ticketCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  ticketContent: { display: 'flex', flexDirection: 'column', gap: '4px' },
  ticketTime: { fontSize: '14px', fontWeight: '800', color: '#1e293b' },
  ticketName: { fontSize: '15px', color: '#334155' },
  statusBadge: { display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', width: 'fit-content' },
  
  adminActions: { display: 'flex', gap: '8px' },
  iconBtn: { background: '#fef3c7', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer' },
  iconBtnDel: { background: '#fee2e2', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer' },

  loadingState: { textAlign: 'center', padding: '30px', color: '#64748b' },
  spinner: { width: '20px', height: '20px', border: '3px solid #cbd5e1', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px auto' },
  emptyState: { textAlign: 'center', padding: '30px', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '15px', border: '2px dashed #e2e8f0' },
  toast: { position: 'fixed', bottom: '20px', right: '20px', padding: '12px 20px', borderRadius: '10px', color: 'white', fontWeight: '600', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 100 }
};