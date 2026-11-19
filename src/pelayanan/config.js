// src/pelayanan/config.js — daftar team & pertanyaan khusus tiap team
export const TEAMS = ['Admin', 'Kids Church', 'Praise & Worship', 'Hospitality', 'Usher', 'Multimedia', 'Dance', 'Doa']
export const ROUTINE_TEAMS = ['Admin', 'Kids Church', 'Praise & Worship', 'Hospitality', 'Usher', 'Multimedia']
export const KOMSEL = ['Sion', 'Pro M', 'Youth', 'Selasa', 'Ignite']

// type: text | textarea | number | choice | multi
export const TEAM_FIELDS = {
  'Admin': [
    { key: 'topik', label: 'Topik khotbah', type: 'text', required: true },
    { key: 'pengkhotbah', label: 'Pengkhotbah', type: 'text', required: true },
    { key: 'angka_dicek', label: 'Angka hadir dari Usher & Kids Church sudah dicek?', type: 'choice', options: ['Ya, sesuai', 'Ada selisih'] },
  ],
  'Kids Church': [
    { key: 'guru', label: 'Nama guru yang bertugas', type: 'textarea', required: true, hint: 'Semua nama — catatan perlindungan anak' },
    { key: 'jam', label: 'Jam ibadah anak', type: 'text', placeholder: '10:00–11:30' },
    { key: 'murid', label: 'Jumlah murid', type: 'number', required: true },
    { key: 'jumlah_guru', label: 'Jumlah guru hadir', type: 'number' },
  ],
  'Praise & Worship': [
    { key: 'md_wl', label: 'Nama MD / WL yang bertugas', type: 'text', required: true },
    { key: 'lengkap', label: 'Pemain & singer lengkap?', type: 'choice', options: ['Lengkap', 'Kurang'] },
  ],
  'Usher': [
    { key: 'dewasa', label: 'Jumlah jemaat dewasa', type: 'number', required: true, hint: 'Termasuk tamu baru, tanpa anak Kids Church' },
    { key: 'tamu_baru', label: 'Jumlah tamu baru', type: 'number', required: true },
    { key: 'cara_hitung', label: 'Cara menghitung', type: 'choice', options: ['Dihitung per orang', 'Perkiraan'] },
  ],
  'Hospitality': [
    { key: 'tamu_disambut', label: 'Jumlah tamu yang disambut', type: 'number' },
    { key: 'tamu_bersedia', label: 'Tamu yang bersedia dihubungi', type: 'number', hint: 'Hanya dengan izin tamu' },
  ],
  'Multimedia': [
    { key: 'kendala', label: 'Kendala teknis hari ini', type: 'multi', options: ['Tidak ada', 'Sound', 'Slide / lirik', 'Live streaming', 'Lainnya'] },
  ],
  'Dance': [],
  'Doa': [],
}

export const STATUS = [
  { id: 'hijau', label: 'Hijau', desc: 'Lancar', color: '#34C759' },
  { id: 'kuning', label: 'Kuning', desc: 'Ada masalah, tertangani', color: '#FFCC00' },
  { id: 'merah', label: 'Merah', desc: 'Perlu bantuan', color: '#FF3B30' },
]

export const ACTION_STATUS = ['Belum mulai', 'Dikerjakan', 'Selesai', 'Butuh keputusan Gembala', 'Dibatalkan']

export function fmtDate(d, opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) {
  try { return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', opts) } catch { return d }
}
