// src/data/celebrations.js — ucapan ulang tahun & anniversary + ayat (Terjemahan Baru)

export const AYAT_ULTAH = [
  { ref: 'Mazmur 139:14', text: 'Aku bersyukur kepada-Mu oleh karena kejadianku dahsyat dan ajaib; ajaib apa yang Kaubuat, dan jiwaku benar-benar menyadarinya.' },
  { ref: 'Yeremia 29:11', text: 'Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.' },
  { ref: 'Bilangan 6:24-26', text: 'TUHAN memberkati engkau dan melindungi engkau; TUHAN menyinari engkau dengan wajah-Nya dan memberi engkau kasih karunia; TUHAN menghadapkan wajah-Nya kepadamu dan memberi engkau damai sejahtera.' },
  { ref: 'Mazmur 90:12', text: 'Ajarlah kami menghitung hari-hari kami sedemikian, hingga kami beroleh hati yang bijaksana.' },
  { ref: 'Lukas 2:52', text: 'Dan Yesus makin bertambah besar dan bertambah hikmat-Nya dan besar-Nya, dan makin dikasihi oleh Allah dan manusia.' },
  { ref: 'Ratapan 3:22-23', text: 'Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi; besar kesetiaan-Mu!' },
]

export const AYAT_ANNIV = [
  { ref: 'Pengkhotbah 4:12', text: 'Dan bilamana seorang dapat dialahkan, dua orang akan dapat bertahan. Tali tiga lembar tak mudah diputuskan.' },
  { ref: 'Kolose 3:14', text: 'Dan di atas semuanya itu: kenakanlah kasih, sebagai pengikat yang mempersatukan dan menyempurnakan.' },
  { ref: '1 Korintus 13:7', text: 'Ia menutupi segala sesuatu, percaya segala sesuatu, mengharapkan segala sesuatu, sabar menanggung segala sesuatu.' },
  { ref: 'Markus 10:9', text: 'Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.' },
  { ref: 'Mazmur 127:1', text: 'Jikalau bukan TUHAN yang membangun rumah, sia-sialah usaha orang yang membangunnya.' },
  { ref: 'Efesus 4:2', text: 'Hendaklah kamu selalu rendah hati, lemah lembut, dan sabar. Tunjukkanlah kasihmu dalam hal saling membantu.' },
]

// Ayat dipilih tetap per tahun (tidak berubah kalau pop-up dibuka ulang di hari yang sama)
export const pickAyat = (list, year) => list[year % list.length]

export const ordinal = (n) => {
  const s = n % 100
  if (s >= 11 && s <= 13) return `${n}th`
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th'}`
}

export const firstName = (full) => {
  const w = (full || '').trim().split(/\s+/)[0] || ''
  return w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''
}

// Apakah tanggal (YYYY-MM-DD) jatuh "hari ini" (WIB)? 29 Feb dirayakan 28 Feb di tahun non-kabisat.
export function isToday(ymd, todayYmd) {
  if (!ymd) return false
  const md = ymd.slice(5), tmd = todayYmd.slice(5), y = Number(todayYmd.slice(0, 4))
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
  if (md === '02-29' && !leap) return tmd === '02-28'
  return md === tmd
}

export const todayWIB = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
