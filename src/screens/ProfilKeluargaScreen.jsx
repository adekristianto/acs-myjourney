// src/screens/ProfilKeluargaScreen.jsx — profil saya + pohon keluarga (hanya pemilik yang bisa lihat)
import { useEffect, useState } from 'react'
import { Page, Section, Row, Field, Chips, inputCls, primaryBtn } from '../pelayanan/ui'
import { getProfil, saveProfil, listKeluarga, addKeluarga, removeKeluarga, HUBUNGAN } from '../services/keluarga'
import { useToast } from '../ui/Toast'

const fmt = (d) => (d ? new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '')

function Person({ name, sub, me }) {
  return (
    <div className={`rounded-xl px-3 py-2 text-center min-w-[96px] max-w-[150px] ${me ? 'bg-[#FF8A00] text-white' : 'bg-[#F2F2F7] dark:bg-black/40'}`}>
      <p className="text-[14px] font-semibold leading-tight break-words">{name}</p>
      {sub && <p className={`text-[11px] mt-0.5 ${me ? 'text-white/80' : 'text-gray-500'}`}>{sub}</p>}
    </div>
  )
}

function Tree({ me, profil, family }) {
  const by = (h) => family.filter(f => f.hubungan === h)
  const parents = [...by('ayah'), ...by('ibu')]
  const spouse = by('pasangan')[0]
  const spouseName = spouse?.nama || (profil?.status_nikah === 'menikah' ? profil?.nama_pasangan : null)
  const kids = by('anak'), grand = by('cucu'), sibs = by('saudara'), other = by('lainnya')
  const Line = () => <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-auto" />
  const RowP = ({ list, label }) => list.length > 0 && (
    <div><p className="text-center text-[11px] uppercase tracking-wide text-gray-400 mb-1">{label}</p>
      <div className="flex flex-wrap justify-center gap-2">{list.map(p => <Person key={p.id} name={p.nama} sub={HUBUNGAN[p.hubungan]} />)}</div></div>
  )
  return (
    <div className="p-4 space-y-1" data-testid="family-tree">
      {parents.length > 0 && <><RowP list={parents} label="Orang tua" /><Line /></>}
      <div className="flex flex-wrap justify-center items-center gap-2">
        <Person name={me} sub="Saya" me />
        {spouseName && <><span className="text-[#FF2D55]">♥</span><Person name={spouseName} sub="Pasangan" /></>}
      </div>
      {kids.length > 0 && <><Line /><RowP list={kids} label="Anak" /></>}
      {grand.length > 0 && <><Line /><RowP list={grand} label="Cucu" /></>}
      {sibs.length > 0 && <div className="pt-3"><RowP list={sibs} label="Saudara" /></div>}
      {other.length > 0 && <div className="pt-3"><RowP list={other} label="Lainnya" /></div>}
      {!family.length && !spouseName && <p className="text-center text-[13px] text-gray-500 pt-2">Tambahkan anggota keluarga di bawah.</p>}
    </div>
  )
}

export default function ProfilKeluargaScreen({ currentUser, onBack }) {
  const toast = useToast()
  const id = currentUser?.id
  const [p, setP] = useState({ tanggal_lahir: '', jenis_kelamin: '', no_hp: '', status_nikah: '', tanggal_menikah: '', nama_pasangan: '' })
  const [saved, setSaved] = useState(null)
  const [fam, setFam] = useState([])
  const [n, setN] = useState({ nama: '', hubungan: 'anak', tanggal_lahir: '', jemaat_acs: false })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setP(v => ({ ...v, [k]: e.target.value }))

  useEffect(() => {
    if (!id) return
    getProfil(id).then(({ data }) => { if (data) { setSaved(data); setP(v => ({ ...v, ...Object.fromEntries(Object.entries(data).map(([k, x]) => [k, x ?? ''])) })) } })
    listKeluarga(id).then(({ data }) => setFam(data))
  }, [id])

  async function save() {
    if (!p.tanggal_lahir) return toast.error('Isi tanggal lahir dulu.')
    if (p.no_hp && !/^[0-9+\-\s]{8,16}$/.test(p.no_hp.trim())) return toast.error('Nomor HP belum benar.')
    setBusy(true)
    try {
      const { data, error } = await saveProfil(id, p)
      if (error) return toast.error('Gagal menyimpan. Coba lagi.')
      setSaved(data); toast.success('Profil tersimpan.')
    } finally { setBusy(false) }
  }
  async function add() {
    if (!n.nama.trim()) return toast.error('Isi nama anggota keluarga.')
    const { data, error } = await addKeluarga(id, n)
    if (error || !data) return toast.error('Gagal menambah. Coba lagi.')
    setFam(f => [...f, data]); setN({ nama: '', hubungan: 'anak', tanggal_lahir: '', jemaat_acs: false })
  }
  async function del(row) {
    const { error } = await removeKeluarga(row.id)
    if (error) return toast.error('Gagal menghapus.')
    setFam(f => f.filter(x => x.id !== row.id))
  }

  return (
    <Page title="Profil & Keluarga" onBack={onBack} backLabel="Beranda">
      {!saved?.tanggal_lahir && (
        <div className="mb-4 rounded-2xl bg-[#FF8A00]/10 p-4 text-[14px]">Lengkapi profilmu supaya gereja bisa ikut merayakan ulang tahun dan anniversary-mu. 🎉</div>
      )}

      <Section title="Profil saya" footer="Hanya kamu yang melihat data ini. Admin gereja hanya menerima nama & tanggal untuk ucapan ulang tahun dan anniversary.">
        <div className="p-4 space-y-3">
          <Field label="Tanggal lahir *"><input type="date" className={inputCls} value={p.tanggal_lahir} onChange={set('tanggal_lahir')} /></Field>
          <Field label="Jenis kelamin"><Chips options={[{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }]} value={p.jenis_kelamin} onChange={v => setP(x => ({ ...x, jenis_kelamin: v }))} /></Field>
          <Field label="Nomor HP / WA"><input className={inputCls} inputMode="tel" value={p.no_hp} onChange={set('no_hp')} placeholder="08…" /></Field>
          <Field label="Status pernikahan"><Chips options={[{ value: 'belum', label: 'Belum menikah' }, { value: 'menikah', label: 'Menikah' }, { value: 'duda_janda', label: 'Duda / janda' }]} value={p.status_nikah} onChange={v => setP(x => ({ ...x, status_nikah: v }))} /></Field>
          {p.status_nikah === 'menikah' && <>
            <Field label="Tanggal menikah"><input type="date" className={inputCls} value={p.tanggal_menikah} onChange={set('tanggal_menikah')} /></Field>
            <Field label="Nama pasangan"><input className={inputCls} value={p.nama_pasangan} onChange={set('nama_pasangan')} /></Field>
          </>}
          <button className={primaryBtn} disabled={busy} onClick={save}>{busy ? 'Menyimpan…' : 'Simpan profil'}</button>
        </div>
      </Section>

      <Section title="Pohon keluarga">
        <Tree me={currentUser?.nama || 'Saya'} profil={saved} family={fam} />
      </Section>

      <Section title={`Anggota keluarga · ${fam.length}`} footer="Isi anak, orang tua, atau saudara. Tanggal lahir anak dipakai untuk ucapan ulang tahun dari gereja.">
        {fam.map((f, i) => (
          <Row key={f.id} first={i === 0}>
            <span className="flex-1 min-w-0"><span className="block text-[16px]">{f.nama}</span>
              <span className="block text-[13px] text-gray-500">{HUBUNGAN[f.hubungan]}{f.tanggal_lahir ? ` · ${fmt(f.tanggal_lahir)}` : ''}{f.jemaat_acs ? ' · jemaat ACS' : ''}</span></span>
            <button onClick={() => del(f)} className="text-[13px] text-[#FF3B30]">Hapus</button>
          </Row>
        ))}
        <div className={`p-4 space-y-3 ${fam.length ? 'border-t border-black/[0.08] dark:border-white/[0.1]' : ''}`}>
          <Field label="Nama"><input className={inputCls} value={n.nama} onChange={e => setN(x => ({ ...x, nama: e.target.value }))} placeholder="Nama lengkap" /></Field>
          <Field label="Hubungan"><Chips options={Object.entries(HUBUNGAN).map(([value, label]) => ({ value, label }))} value={n.hubungan} onChange={v => setN(x => ({ ...x, hubungan: v }))} /></Field>
          <Field label="Tanggal lahir (opsional)"><input type="date" className={inputCls} value={n.tanggal_lahir} onChange={e => setN(x => ({ ...x, tanggal_lahir: e.target.value }))} /></Field>
          <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" checked={n.jemaat_acs} onChange={e => setN(x => ({ ...x, jemaat_acs: e.target.checked }))} className="w-5 h-5 accent-[#FF8A00]" />Juga jemaat ACS (punya akun My Journey sendiri)</label>
          <button onClick={add} className="w-full h-11 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-[#FF8A00] font-semibold">+ Tambah anggota keluarga</button>
        </div>
      </Section>
    </Page>
  )
}
