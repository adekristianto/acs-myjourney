// src/pelayanan/RolesView.jsx — super admin mengatur siapa memegang peran apa
import { useEffect, useMemo, useState } from 'react'
import { listRoles, listJemaat, addRole, removeRole } from '../services/pelayanan'
import { TEAMS, KOMSEL } from './config'
import { useToast } from '../ui/Toast'
import { Page, Section, Row, inputCls } from './ui'

const ROLE_LABEL = { super_admin: 'Super admin', admin: 'Admin', ketua_team: 'Ketua team pelayanan', ketua_komsel: 'Ketua komsel', pembantu_komsel: 'Pembantu komsel', gembala: 'Gembala / tim pastoral', pekerja: 'Pekerja' }

export default function RolesView({ onBack }) {
  const toast = useToast()
  const [roles, setRoles] = useState([])
  const [people, setPeople] = useState([])
  const [draft, setDraft] = useState({ jemaat_id: '', role: 'ketua_team', scope: '' })
  const [confirm, setConfirm] = useState(null)
  const load = async () => {
    const [r, p] = await Promise.all([listRoles(), listJemaat()])
    setRoles(r.data); setPeople(p.data)
  }
  useEffect(() => { load() }, [])
  const name = useMemo(() => Object.fromEntries(people.map(p => [p.id, p.nama])), [people])
  const scopes = draft.role === 'ketua_team' ? TEAMS : draft.role === 'gembala' ? ['Semua', ...KOMSEL] : draft.role.includes('komsel') ? KOMSEL : []

  const add = async () => {
    if (!draft.jemaat_id) return toast.error('Pilih orangnya.')
    if (scopes.length && !draft.scope) return toast.error('Pilih team / komsel.')
    const { error } = await addRole(draft.jemaat_id, draft.role, scopes.length ? draft.scope : '')
    if (error) return toast.error('Gagal menambah (mungkin sudah ada).')
    toast.success('Peran ditambahkan'); setDraft(d => ({ ...d, jemaat_id: '' })); load()
  }
  const del = async (r) => {
    const key = r.jemaat_id + r.role + r.scope
    if (confirm !== key) { setConfirm(key); return }
    const { error } = await removeRole(r.jemaat_id, r.role, r.scope)
    if (error) return toast.error('Gagal menghapus.')
    setConfirm(null); toast.success('Peran dihapus'); load()
  }

  return (
    <Page title="Kelola Peran" onBack={onBack} backLabel="Pelayanan">
      <Section title="Tambah peran">
        <div className="p-4 space-y-2">
          <select className={inputCls} value={draft.jemaat_id} onChange={e => setDraft(d => ({ ...d, jemaat_id: e.target.value }))}>
            <option value="">— pilih jemaat —</option>{people.map(p => <option key={p.id} value={p.id}>{p.nama}{p.komsel ? ` (${p.komsel})` : ''}</option>)}
          </select>
          <select className={inputCls} value={draft.role} onChange={e => setDraft(d => ({ ...d, role: e.target.value, scope: '' }))}>
            {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {scopes.length > 0 && (
            <select className={inputCls} value={draft.scope} onChange={e => setDraft(d => ({ ...d, scope: e.target.value }))}>
              <option value="">— pilih {draft.role === 'ketua_team' ? 'team' : 'komsel'} —</option>{scopes.map(s => <option key={s} value={s}>{s === 'Semua' ? 'Semua komsel' : s}</option>)}
            </select>
          )}
          <button onClick={add} className="w-full h-11 rounded-xl bg-[#FF8A00] text-white font-semibold">Tambah</button>
        </div>
      </Section>
      {Object.keys(ROLE_LABEL).map(role => {
        const list = roles.filter(r => r.role === role)
        if (!list.length) return null
        return (
          <Section key={role} title={ROLE_LABEL[role]}>
            {list.map((r, i) => {
              const key = r.jemaat_id + r.role + r.scope
              return (
                <Row key={key} first={i === 0}>
                  <span className="flex-1 text-[16px]">{name[r.jemaat_id] || '…'}</span>
                  {r.scope && <span className="text-[14px] text-gray-500">{r.scope}</span>}
                  <button onClick={() => del(r)} className={`text-[13px] font-semibold ${confirm === key ? 'text-white bg-[#FF3B30] px-2 py-1 rounded-lg' : 'text-[#FF3B30]'}`}>{confirm === key ? 'Yakin hapus?' : 'Hapus'}</button>
                </Row>
              )
            })}
          </Section>
        )
      })}
    </Page>
  )
}
