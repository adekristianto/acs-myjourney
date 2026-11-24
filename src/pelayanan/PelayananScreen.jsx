// src/pelayanan/PelayananScreen.jsx — pintu masuk modul Pelayanan (hanya untuk yang punya peran)
import { useState } from 'react'
import { Page, Section, Row } from './ui'
import { IconChevron } from '../ui/icons'
import ReportForm from './ReportForm'
import AdminPanel from './AdminPanel'
import ActionsView from './ActionsView'
import RolesView from './RolesView'
import KomselAttendance from './KomselAttendance'
import { KomselOverview, KomselMembersAdmin } from './KomselOverview'
import DevotionSettings from './DevotionSettings'
import AbsensiAdmin from './AbsensiAdmin'
import PerayaanAdmin from './PerayaanAdmin'
import { KOMSEL } from './config'

const Item = ({ icon, color, title, sub, onClick, first }) => (
  <Row onClick={onClick} first={first}>
    <span className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-white text-[15px] shrink-0" style={{ background: color }}>{icon}</span>
    <span className="flex-1 min-w-0"><span className="block text-[17px]">{title}</span>{sub && <span className="block text-[13px] text-gray-500 dark:text-gray-400">{sub}</span>}</span>
    <span className="text-gray-300 dark:text-gray-600"><IconChevron /></span>
  </Row>
)

export default function PelayananScreen({ currentUser, roles, onBack }) {
  const [view, setView] = useState({ name: 'hub' })
  const isSuper = roles.some(r => r.role === 'super_admin')
  const isAdmin = isSuper || roles.some(r => r.role === 'admin')
  const myTeams = roles.filter(r => r.role === 'ketua_team').map(r => r.scope)
  const myKomsel = [...new Set(roles.filter(r => ['ketua_komsel', 'pembantu_komsel', 'gembala'].includes(r.role))
    .flatMap(r => r.scope === 'Semua' ? KOMSEL : [r.scope]))]
  const back = () => setView({ name: 'hub' })

  if (view.name === 'report') return <ReportForm currentUser={currentUser} team={view.team} onBack={back} />
  if (view.name === 'panel') return <AdminPanel currentUser={currentUser} onBack={back} onOpenActions={() => setView({ name: 'actions' })} />
  if (view.name === 'actions') return <ActionsView currentUser={currentUser} onBack={back} />
  if (view.name === 'roles') return <RolesView onBack={back} />
  if (view.name === 'komsel') return <KomselAttendance komsel={view.komsel} currentUser={currentUser} onBack={view.from === 'overview' ? () => setView({ name: 'komselOverview' }) : back} backLabel={view.from === 'overview' ? 'Komsel' : 'Pelayanan'} />
  if (view.name === 'komselOverview') return <KomselOverview onBack={back} onOpen={k => setView({ name: 'komsel', komsel: k, from: 'overview' })} onManage={() => setView({ name: 'komselMembers' })} />
  if (view.name === 'perayaan') return <PerayaanAdmin onBack={back} />
  if (view.name === 'absensi') return <AbsensiAdmin currentUser={currentUser} onBack={back} />
  if (view.name === 'devotion') return <DevotionSettings currentUser={currentUser} onBack={back} />
  if (view.name === 'komselMembers') return <KomselMembersAdmin onBack={() => setView({ name: 'komselOverview' })} />

  return (
    <Page title="Pelayanan" onBack={onBack} backLabel="Beranda">
      {(myTeams.length > 0 || isAdmin) && (
        <Section title="Laporan Minggu" footer="Diisi setelah ibadah, paling lambat Minggu 20:00. ±2 menit.">
          {myTeams.map((t, i) => <Item key={t} first={i === 0} icon="✎" color="#FF8A00" title={`Lapor: ${t}`} onClick={() => setView({ name: 'report', team: t })} />)}
          {isAdmin && <Item first={myTeams.length === 0} icon="✎" color="#8E8E93" title="Isi atas nama team lain" sub="Untuk admin" onClick={() => setView({ name: 'report', team: null })} />}
        </Section>
      )}
      {myKomsel.length > 0 && (
        <Section title="Absensi Komsel">
          {myKomsel.map((k, i) => <Item key={k} first={i === 0} icon="☑" color="#AF52DE" title={`Komsel ${k}`} sub="Catat kehadiran · lihat siapa perlu disapa" onClick={() => setView({ name: 'komsel', komsel: k })} />)}
        </Section>
      )}
      {isAdmin && (
        <Section title="Admin">
          <Item first icon="☑" color="#FF2D55" title="Absensi" sub="Minggu · Meeting Pekerja · Morning Devotion" onClick={() => setView({ name: 'absensi' })} />
          <Item icon="🎂" color="#FF9500" title="Ulang Tahun & Anniversary" sub="Per bulan · salin ke WhatsApp" onClick={() => setView({ name: 'perayaan' })} />
          <Item icon="▤" color="#0A84FF" title="Panel Laporan" sub="Pilih tanggal → semuanya tersusun" onClick={() => setView({ name: 'panel' })} />
          <Item icon="✓" color="#34C759" title="Tindakan" sub="Siapa beresin & kapan selesai" onClick={() => setView({ name: 'actions' })} />
          <Item icon="☑" color="#AF52DE" title="Komsel" sub="Ringkasan 5 komsel · atur anggota" onClick={() => setView({ name: 'komselOverview' })} />
          <Item icon="☀" color="#5856D6" title="Morning Devotion" sub="Bahan eksposisi & link Zoom" onClick={() => setView({ name: 'devotion' })} />
        </Section>
      )}
      {isSuper && (
        <Section title="Super admin">
          <Item first icon="⚙" color="#5E5CE6" title="Kelola Peran" sub="Admin, ketua team, komsel & tim pastoral" onClick={() => setView({ name: 'roles' })} />
        </Section>
      )}
    </Page>
  )
}
