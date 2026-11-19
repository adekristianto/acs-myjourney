// src/screens/SocialScreen.jsx
import JournalForm from '../components/JournalForm'
export default function SocialScreen(props) {
  return <JournalForm {...props} dimension="social" title={{ id: 'Sosial', en: 'Social' }}
    fields={[{ key: 'note', required: true, label: { id: 'Siapa yang kamu temui atau berkati hari ini?', en: 'Who did you connect with or bless today?' },
      placeholder: { id: 'Contoh: menelepon teman yang sedang sakit…', en: 'e.g. called a friend who’s been unwell…' } }]} />
}
