// src/screens/WisdomScreen.jsx
import JournalForm from '../components/JournalForm'
export default function WisdomScreen(props) {
  return <JournalForm {...props} dimension="wisdom" title={{ id: 'Akal Budi', en: 'Wisdom' }}
    fields={[{ key: 'note', required: true, label: { id: 'Apa yang kamu pelajari hari ini?', en: 'What did you learn today?' },
      placeholder: { id: 'Buku, percakapan, pelajaran hidup…', en: 'A book, a conversation, a life lesson…' } }]} />
}
