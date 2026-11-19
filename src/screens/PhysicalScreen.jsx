// src/screens/PhysicalScreen.jsx
import JournalForm from '../components/JournalForm'
export default function PhysicalScreen(props) {
  return <JournalForm {...props} dimension="physical" title={{ id: 'Fisik', en: 'Physical' }}
    fields={[{ key: 'note', required: true, label: { id: 'Bagaimana kamu merawat tubuhmu hari ini?', en: 'How did you care for your body today?' },
      placeholder: { id: 'Contoh: jalan pagi 30 menit, tidur jam 22.30…', en: 'e.g. 30-minute walk, in bed by 10:30…' } }]} />
}
