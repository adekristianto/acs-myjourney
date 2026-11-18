// src/data/greetings.js
// Sapaan Beranda My Journey.
// Tiap bahasa ditulis sendiri-sendiri (BUKAN terjemahan): 7 pagi, 7 siang, 7 malam.
// Pagi 04:00–10:59 · Siang 11:00–17:59 · Malam 18:00–03:59 (WIB)
// Admin boleh mengganti kalimat mana pun — cukup ubah teks di antara tanda kutip.

export const greetings = {
  id: {
    pagi: [
      'Pagi ini apa kabar? Kasih setia-Nya baru lagi, lho.',
      'Tuhan memberkati langkahmu hari ini.',
      'Ngopi dulu, doa dulu. Baru kita mulai.',
      'Kamu berharga. Jangan biarkan dunia bilang sebaliknya. Kristus ada di dalammu — yuk, gas hari ini!',
      'Tuhan sudah duluan ada di hari ini. Tenang saja.',
      'Sedikit demi sedikit, lama-lama jadi bukit. Tetap bertumbuh, ya.',
      'Bersyukur dulu pagi ini — masih dikasih napas, itu anugerah.',
    ],
    siang: [
      'Sudah setengah hari. Istirahat sebentar sama Tuhan, yuk.',
      'Lagi sibuk-sibuknya? Dia tetap dekat, kok.',
      'Gimana harimu sejauh ini? Cerita saja sama Dia.',
      'Capek itu wajar. Minta kekuatan baru, ya.',
      'Ada yang bisa kamu bantu hari ini?',
      'Kerjakan bagianmu dengan sepenuh hati. Sisanya bagian Tuhan.',
      'Kamu dikasihi bukan karena kerjamu. Ingat itu, ya.',
    ],
    malam: [
      'Hari ini sudah cukup. Taruh semuanya di tangan Tuhan.',
      'Satu hal yang kamu syukuri hari ini apa?',
      'Tidur yang nyenyak. Yang jaga kamu nggak pernah tidur.',
      'Apa pun yang terjadi hari ini, kasih-Nya tetap sama.',
      'Sebelum tidur, coba ingat: di mana Tuhan hadir hari ini?',
      'Damai sejahtera Tuhan menyertaimu malam ini.',
      'Besok cerita baru lagi. Istirahat dulu, ya.',
    ],
  },
  en: {
    pagi: [
      'Morning! His mercies are new today.',
      'May the Lord bless your steps today.',
      'Coffee, prayer, then go. You’ve got this.',
      'You are precious. Don’t let this world tell you otherwise. Christ in you — let’s rock this day!',
      'God got to today before you did.',
      'Small steps still count. Keep growing.',
      'You woke up today. That’s grace already.',
    ],
    siang: [
      'Halfway through. Take a breather with God.',
      'Busy day? He’s right there with you.',
      'How’s it going so far? Talk to Him about it.',
      'Running low? Ask for fresh strength.',
      'Who could use a little kindness from you today?',
      'Do your part well. Leave the rest to Him.',
      'You’re loved for who you are, not what you get done.',
    ],
    malam: [
      'That’s enough for today. Hand the rest to God.',
      'What’s one thing you’re grateful for tonight?',
      'Sleep well. The One who watches over you never sleeps.',
      'Whatever today held, His love hasn’t changed.',
      'Before bed: where did you see God today?',
      'Grace and peace to you tonight.',
      'Tomorrow’s a new page. Rest now.',
    ],
  },
}

function hourWIB() {
  return Number(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false })) % 24
}

// 'pagi' | 'siang' | 'malam'
export function getTimeOfDayWIB() {
  const h = hourWIB()
  if (h >= 4 && h < 11) return 'pagi'
  if (h >= 11 && h < 18) return 'siang'
  return 'malam'
}

// Sapaan pendek di atas nama
export function getSalutation(lang = 'id') {
  const h = hourWIB()
  if (lang === 'en') {
    if (h >= 4 && h < 12) return 'Good morning'
    if (h >= 12 && h < 18) return 'Good afternoon'
    return 'Good evening'
  }
  if (h >= 4 && h < 11) return 'Selamat pagi'
  if (h >= 11 && h < 15) return 'Selamat siang'
  if (h >= 15 && h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

// Pesan acak sesuai bahasa & waktu; tidak mengulang pesan terakhir
export function getGreetingMessage(lang = 'id') {
  const L = lang === 'en' ? 'en' : 'id'
  const slot = getTimeOfDayWIB()
  const list = greetings[L][slot]
  const key = `mj-greet-${L}-${slot}`
  let last = -1
  try { last = Number(localStorage.getItem(key) ?? -1) } catch (e) {}
  let i = Math.floor(Math.random() * list.length)
  if (i === last) i = (i + 1) % list.length
  try { localStorage.setItem(key, String(i)) } catch (e) {}
  return list[i]
}