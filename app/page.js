"use client";
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.title}>
          Sewa Lapangan <span style={styles.highlight}>Tanpa Ribet.</span>
        </h1>
        <p style={styles.subtitle}>
          Cek jadwal kosong secara real-time, booking dalam hitungan detik, 
          dan atur jadwal latihan tim-mu sekarang juga.
        </p>
        
        <div style={styles.ctaGroup}>
          <Link href="/booking" style={styles.primaryBtn}>
            Mulai Booking Sekarang 🚀
          </Link>
          <button style={styles.secondaryBtn} onClick={() => alert("Fitur CS segera hadir!")}>
            Hubungi Admin
          </button>
        </div>
      </section>

      {/* Feature Section */}
      <div style={styles.features}>
        <div style={styles.featureCard}>
          <div style={styles.icon}>⚡</div>
          <h3>Real-Time</h3>
          <p>Status lapangan langsung terupdate detik itu juga.</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.icon}>📅</div>
          <h3>Anti-Bentrok</h3>
          <p>Sistem cerdas mencegah jadwal ganda otomatis.</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.icon}>📱</div>
          <h3>Fleksibel</h3>
          <p>Atur durasi main sesuka hatimu, hitungan menit.</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', sans-serif",
    color: '#333',
    lineHeight: '1.6',
  },
  hero: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '0 0 50px 50px', // Lengkungan bawah unik
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '20px',
    color: '#1e293b',
  },
  highlight: {
    color: '#2563eb', // Biru branding
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#64748b',
    maxWidth: '600px',
    margin: '0 auto 40px auto',
  },
  ctaGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },
  primaryBtn: {
    padding: '15px 30px',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '30px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
  },
  secondaryBtn: {
    padding: '15px 30px',
    backgroundColor: 'white',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  features: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    padding: '60px 20px',
    flexWrap: 'wrap',
  },
  featureCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '20px',
    width: '300px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '15px',
  }
};