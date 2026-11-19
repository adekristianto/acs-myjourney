// src/screens/BibleJournalScreen.jsx — Rohani
import JournalForm from '../components/JournalForm'
export default function BibleJournalScreen(props) {
  return <JournalForm {...props} dimension="spiritual" title={{ id: 'Rohani', en: 'Spiritual' }}
    fields={[
      { key: 'verse', required: true, rows: 1, label: { id: 'Ayat yang dibaca', en: 'Scripture read' }, placeholder: { id: 'Contoh: Ibrani 12:1–3', en: 'e.g. Hebrews 12:1–3' } },
      { key: 'message', rows: 5, label: { id: 'Apa yang Tuhan katakan padamu?', en: 'What is God saying to you?' }, placeholder: { id: 'Tulis dengan bahasamu sendiri…', en: 'In your own words…' } },
      { key: 'commitment', rows: 3, label: { id: 'Langkah kecil hari ini', en: 'One small step today' }, placeholder: { id: 'Apa yang akan kamu lakukan?', en: 'What will you do?' } },
    ]} />
}
