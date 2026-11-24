// src/pelayanan/AbsensiAdmin.jsx — admin: absensi Ibadah Minggu, Meeting Pekerja, Morning Devotion
import { useEffect, useMemo, useState, useCallback } from 'react'
import QRCode from 'qrcode'
import { Page, Section, Row, Field, inputCls, inputBase, primaryBtn } from './ui'
import { JENIS, checkinLink, listAcara, openAcara, updateAcara, getKehadiran, setStatus, addManual, removeKehadiran, ringkasMinggu } from '../services/absensi'
import { listJemaat } from '../services/pelayanan'
import { getTodayWIB } from '../services/database'
import { fmtDate } from './config'
import { useToast } from '../ui/Toast'

function Switch({ on, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`relative w-[51px] h-[31px] rounded-full transition-colors shrink-0 ${on ? 'bg-[#34C759]' : 'bg-black/[0.12] dark:bg-white/[0.2]'}`}>
      <span className={`absolute top-[2px] left-[2px] w-[27px] h-[27px] rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  )
}

function QrOverlay({ jenis, onClose }) {
  const [src, setSrc] = useState('')
  useEffect(() => { QRCode.toDataURL(checkinLink(jenis), { width: 720, margin: 2 }).then(setSrc) }, [jenis])
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-black" onClick={onClose}>
      <p className="text-[15px] font-semibold uppercase tracking-wide text-gray-500">ACS My Journey</p>
      <h2 className="text-[28px] font-bold mt-1 text-center">Absen {JENIS[jenis].label}</h2>
      {src && <img src={src} alt="QR absensi" className="w-[78vw] max-w-[420px] mt-4" />}
      <p className="mt-4 text-[17px] text-center">Buka kamera HP → scan → login My Journey</p>
      <p className="mt-6 text-[13px] text-gray-400">Ketuk di mana saja untuk menutup</p>
    </div>
  )
}

function Session({ acara: initial, currentUser, onBack }) {
  const toast = useToast()
  const [a, setA] = useState(initial)
  const [list, setList] = useState([])
  const [people, setPeople] = useState([])
  const [pick, setPick] = useState('')
  const [qr, setQr] = useState(false)
  const [busy, setBusy] = useState(false)
  const [num, setNum] = useState({ dewasa: initial.dewasa ?? '', anak: initial.anak ?? '', total_peserta: initial.total_peserta ?? '', catatan: initial.catatan ?? '', link: initial.link ?? '' })
  const j = JENIS[a.jenis]

  const load = useCallback(async () => {
    const { data } = await getKehadiran(a.id); setList(data)
  }, [a.id])
  useEffect(() => { load(); listJemaat().then(({ data }) => setPeople(data || [])) }, [load])

  const name = useMemo(() => Object.fromEntries(people.map(p => [p.id, p.nama])), [people])
  const waiting = list.filter(k => k.status === 'menunggu')
  const ok = list.filter(k => k.status === 'disetujui')
  const rejected = list.filter(k => k.status === 'ditolak')
  const notPresent = people.filter(p => !list.some(k => k.jemaat_id === p.id))
  const sum = ringkasMinggu({ dewasa: num.dewasa, anak: num.anak }, list)

  const patch = async (fields, msg) => {
    setBusy(true)
    try {
      const { data, error } = await updateAcara(a.id, fields)
      if (error || !data) return toast.error('Gagal menyimpan. Coba lagi.')
      setA(data); if (msg) toast.success(msg)
    } finally { setBusy(false) }
  }
  const status = async (ids, s) => {
    if (!ids.length) return
    const { error } = await setStatus(a.id, ids, s)
    if (error) return toast.error('Gagal. Coba lagi.')
    load()
  }
  const add = async () => {
    if (!pick) return
    const { error } = await addManual(a.id, pick)
    if (error) return toast.error('Gagal menambah.')
    setPick(''); load()
  }
  const numFields = () => ({
    dewasa: num.dewasa === '' ? null : Number(num.dewasa), anak: num.anak === '' ? null : Number(num.anak),
    total_peserta: num.total_peserta === '' ? null : Number(num.total_peserta), catatan: num.catatan, link: (num.link || '').trim() || null,
  })
  const sahkan = () => {
    if (waiting.length) return toast.error(`Masih ada ${waiting.length} yang menunggu persetujuan.`)
    if (a.jenis === 'minggu' && num.dewasa === '') return toast.error('Isi jumlah dewasa dulu.')
    if (a.jenis === 'devotion' && num.total_peserta === '') return toast.error('Isi jumlah peserta dulu.')
    patch({ ...numFields(), buka: false, disetujui: true, disetujui_oleh: currentUser?.id }, 'Absensi disahkan.')
  }

  const badge = a.disetujui ? ['Disahkan', 'bg-[#34C759]'] : a.buka && j.scan ? ['Scan dibuka', 'bg-[#FF8A00]'] : ['Belum disahkan', 'bg-gray-400']

  return (
    <Page title={j.label} onBack={onBack} backLabel="Absensi"
      right={<button onClick={load} className="text-[#FF8A00] text-[15px] font-medium">Muat ulang</button>}>
      {qr && <QrOverlay jenis={a.jenis} onClose={() => setQr(false)} />}
      <div className="-mt-3 mb-4 flex items-center gap-2">
        <span className="text-[15px] text-gray-500">{fmtDate(a.tanggal)}</span>
        <span className={`text-[11px] font-bold uppercase tracking-wide text-white rounded-full px-2 py-0.5 ${badge[1]}`}>{badge[0]}</span>
      </div>

      {j.scan && !a.disetujui && (
        <Section title="Scan QR / tap NFC" footer="QR dan tag NFC berlaku tetap untuk setiap minggu. Scan hanya diterima saat sesi hari ini dibuka.">
          <Row first><span className="flex-1 text-[16px]">Terima scan</span><Switch on={a.buka} onClick={() => patch({ buka: !a.buka })} /></Row>
          <Row onClick={() => setQr(true)}><span className="flex-1 text-[16px] text-[#FF8A00] font-medium">Tampilkan QR di layar</span></Row>
          <Row onClick={() => navigator.clipboard?.writeText(checkinLink(a.jenis)).then(() => toast.success('Link disalin. Tulis ke tag NFC.'))}>
            <span className="flex-1 min-w-0"><span className="block text-[16px] text-[#FF8A00] font-medium">Salin link untuk tag NFC</span>
              <span className="block text-[12px] text-gray-500 truncate">{checkinLink(a.jenis)}</span></span>
          </Row>
        </Section>
      )}

      {a.jenis === 'minggu' && (
        <Section title="Hitungan usher" footer="Tamu = dewasa − jemaat terdaftar yang hadir.">
          <div className="p-4 grid grid-cols-2 gap-3">
            <Field label="Dewasa"><input type="number" inputMode="numeric" min="0" className={inputCls} value={num.dewasa} onChange={e => setNum(n => ({ ...n, dewasa: e.target.value }))} disabled={a.disetujui} /></Field>
            <Field label="Anak"><input type="number" inputMode="numeric" min="0" className={inputCls} value={num.anak} onChange={e => setNum(n => ({ ...n, anak: e.target.value }))} disabled={a.disetujui} /></Field>
          </div>
          <div className="grid grid-cols-4 text-center border-t border-black/[0.08] dark:border-white/[0.1]">
            {[['Total', sum.total], ['Jemaat', sum.jemaat], ['Tamu', sum.tamu], ['Anak', sum.anak]].map(([l, v]) => (
              <div key={l} className="py-3"><p className="text-[22px] font-bold">{v}</p><p className="text-[12px] text-gray-500">{l}</p></div>
            ))}
          </div>
        </Section>
      )}

      {a.jenis === 'devotion' && (
        <Section title="Peserta" footer="Jumlah semua peserta Zoom, termasuk yang bukan jemaat ACS.">
          <div className="p-4"><Field label="Jumlah peserta">
            <input type="number" inputMode="numeric" min="0" className={inputCls} value={num.total_peserta} onChange={e => setNum(n => ({ ...n, total_peserta: e.target.value }))} disabled={a.disetujui} />
          </Field></div>
        </Section>
      )}

      {waiting.length > 0 && (
        <Section title={`Menunggu persetujuan · ${waiting.length}`}>
          <div className="flex justify-end px-4 pt-3 text-[14px] font-semibold text-[#34C759]"><button onClick={() => status(waiting.map(k => k.jemaat_id), 'disetujui')}>Setujui semua</button></div>
          {waiting.map((k, i) => (
            <Row key={k.jemaat_id} first={i === 0}>
              <span className="flex-1 text-[16px]">{name[k.jemaat_id] || '…'}</span>
              <button onClick={() => status([k.jemaat_id], 'ditolak')} className="w-9 h-9 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] font-bold" aria-label="Tolak">✕</button>
              <button onClick={() => status([k.jemaat_id], 'disetujui')} className="w-9 h-9 rounded-full bg-[#34C759]/15 text-[#34C759] font-bold" aria-label="Setujui">✓</button>
            </Row>
          ))}
        </Section>
      )}

      <Section title={`Hadir · ${ok.length}`} footer={rejected.length ? `${rejected.length} scan ditolak.` : null}>
        {!a.disetujui && (
          <div className="p-4 flex gap-2">
            <select className={inputBase + ' flex-1 min-w-0'} value={pick} onChange={e => setPick(e.target.value)}>
              <option value="">+ Tambah jemaat yang hadir…</option>
              {notPresent.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>
            <button onClick={add} className="px-4 rounded-xl bg-[#FF8A00] text-white font-semibold">Tambah</button>
          </div>
        )}
        {ok.map((k, i) => (
          <Row key={k.jemaat_id} first={i === 0 && a.disetujui}>
            <span className="flex-1 text-[16px]">{name[k.jemaat_id] || '…'}</span>
            <span className="text-[12px] text-gray-500">{k.cara === 'scan' ? 'scan' : 'admin'}</span>
            {!a.disetujui && <button onClick={() => removeKehadiran(a.id, k.jemaat_id).then(load)} className="text-[13px] text-[#FF3B30]">Hapus</button>}
          </Row>
        ))}
        {!ok.length && a.disetujui && <p className="p-4 text-[15px] text-gray-500">Tidak ada jemaat terdaftar yang tercatat.</p>}
      </Section>

      {a.jenis !== 'devotion' && (
        <Section title={a.jenis === 'minggu' ? 'Link YouTube ibadah' : 'Link meeting'}
          footer={a.jenis === 'minggu' ? 'Tampil di Beranda semua jemaat selama seminggu.' : 'Hanya terlihat oleh jemaat berperan Pekerja (dan pelayan lain).'}>
          <div className="p-4"><input className={inputCls} inputMode="url" autoCapitalize="off" autoCorrect="off" value={num.link}
            onChange={e => setNum(n => ({ ...n, link: e.target.value }))} placeholder={a.jenis === 'minggu' ? 'https://youtube.com/live/…' : 'https://zoom.us/j/… atau Google Meet'} />
            <button onClick={() => { if (num.link && !/^https:\/\//.test(num.link.trim())) return toast.error('Link harus diawali https://'); patch({ link: (num.link || '').trim() || null }, 'Link tersimpan.') }}
              className="mt-2 text-[15px] font-semibold text-[#FF8A00]">Simpan link</button></div>
        </Section>
      )}

      <Section title="Catatan">
        <div className="p-4"><textarea rows={2} className={inputCls} value={num.catatan} onChange={e => setNum(n => ({ ...n, catatan: e.target.value }))} disabled={a.disetujui} placeholder="Opsional" /></div>
      </Section>

      {!a.disetujui ? (
        <div className="space-y-3">
          <button className={primaryBtn} disabled={busy} onClick={sahkan}>Sahkan absensi</button>
          <button className="w-full h-11 text-[#FF8A00] font-semibold" disabled={busy} onClick={() => patch(numFields(), 'Tersimpan.')}>Simpan dulu (belum disahkan)</button>
        </div>
      ) : (
        <button className="w-full h-11 text-[#FF3B30] font-semibold" disabled={busy} onClick={() => patch({ disetujui: false }, 'Pengesahan dibatalkan. Data bisa diubah lagi.')}>Batalkan pengesahan</button>
      )}
    </Page>
  )
}

export default function AbsensiAdmin({ currentUser, onBack }) {
  const toast = useToast()
  const [tanggal, setTanggal] = useState(getTodayWIB())
  const [recent, setRecent] = useState([])
  const [open, setOpen] = useState(null)
  const load = () => listAcara().then(({ data }) => setRecent(data))
  useEffect(() => { load() }, [])

  const start = async (jenis) => {
    const { data, error } = await openAcara(jenis, tanggal, currentUser?.id)
    if (error || !data) return toast.error('Gagal membuka sesi. Coba lagi.')
    setOpen(data)
  }

  if (open) return <Session acara={open} currentUser={currentUser} onBack={() => { setOpen(null); load() }} />

  return (
    <Page title="Absensi" onBack={onBack} backLabel="Pelayanan">
      <Section title="Buka absensi" footer="Komsel diabsenkan oleh ketua komsel masing-masing.">
        <div className="p-4"><Field label="Tanggal"><input type="date" className={inputCls} value={tanggal} onChange={e => setTanggal(e.target.value)} /></Field></div>
        {Object.entries(JENIS).map(([k, v]) => (
          <Row key={k} onClick={() => start(k)}>
            <span className="flex-1"><span className="block text-[16px] font-medium">{v.label}</span>
              <span className="block text-[13px] text-gray-500">{v.scan ? 'Scan QR / NFC + persetujuan admin' : 'Admin mengisi jumlah peserta'}</span></span>
            <span className="text-gray-400">›</span>
          </Row>
        ))}
      </Section>
      {recent.length > 0 && (
        <Section title="Sesi terakhir">
          {recent.map((r, i) => (
            <Row key={r.id} first={i === 0} onClick={() => setOpen(r)}>
              <span className="flex-1"><span className="block text-[16px]">{JENIS[r.jenis]?.label}</span>
                <span className="block text-[13px] text-gray-500">{fmtDate(r.tanggal)}</span></span>
              <span className={`text-[12px] font-semibold ${r.disetujui ? 'text-[#34C759]' : 'text-[#FF8A00]'}`}>{r.disetujui ? 'Disahkan' : 'Belum'}</span>
              <span className="text-gray-400">›</span>
            </Row>
          ))}
        </Section>
      )}
    </Page>
  )
}
