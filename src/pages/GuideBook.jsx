import { useState } from 'react'
import './GuideBook.css'

const GUIDES = {
  Artisan: {
    intro: 'How to source materials as part of a group, at a bulk price you would not get alone.',
    steps: [
      'Register with your name, Aadhar, store location and phone number — this verifies you to suppliers and other artisans.',
      'List each material you need with a clear specification, quantity, unit, your location and the date you need it by.',
      'rawMitra groups your request with nearby artisans who need the same material. Review the combined quantity and the supplier offers ranked by price, quality rating and distance.',
      'Use the live cost calculator to see exactly your share before confirming.',
      'If no supplier currently matches, broadcast a request — other artisans with the same need can join you, and you\'ll be grouped and shown offers automatically once matched.',
      'After confirming, track pickup and shipment from your dashboard. Rate the supplier once your order is delivered.',
    ],
    tips: [
      'Larger, clearly-specified requests attract more supplier interest.',
      'Keep your required date realistic — tight timelines reduce your matching pool.',
    ],
  },
  Supplier: {
    intro: 'How to reach grouped bulk orders instead of selling to artisans one at a time.',
    steps: [
      'Register your business with name, Aadhar, store location, phone number and the materials you stock (specification, quantity, unit).',
      'Set your bulk price per material and the minimum quantity that price applies to.',
      'Tell rawMitra whether you can arrange shipment or pickup yourself, or need a coordinator.',
      'When an artisan group selects your offer and confirms, you\'ll see the order and the coordinator (if any) assigned.',
      'Build your rating by delivering the agreed quality and quantity on time.',
    ],
    tips: [
      'A competitive price and a nearby location both improve your ranking in artisan groups\' matching results.',
      'A higher rating outweighs a slightly higher price for many groups — quality and reliability matter.',
    ],
  },
  Coordinator: {
    intro: 'How to take on and manage a confirmed deal from pickup or shipment through to delivery.',
    steps: [
      'Register with your name, Aadhar, phone number and previous logistics experience.',
      'From your dashboard, claim deals that need a coordinator (where the supplier selected "none" for logistics).',
      'Update the tracking stage as the order moves: collected, in transit, out for delivery, delivered.',
      'Keep artisans and the supplier informed — accurate tracking status is a rated part of your service.',
      'Build your track record; a strong rating helps you get chosen for larger or higher-value deals.',
    ],
    tips: [
      'Update tracking stages promptly — artisans see this in real time on their own dashboard.',
    ],
  },
}

export default function GuideBook() {
  const [tab, setTab] = useState('Artisan')
  const g = GUIDES[tab]

  return (
    <div className="page page-narrow">
      <h1>Guidebook</h1>
      <p>A short walkthrough for each role on rawMitra.</p>

      <div className="guide-tabs">
        {Object.keys(GUIDES).map((t) => (
          <button key={t} className={`guide-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="guide-section">
        <p>{g.intro}</p>
        <h3>Steps</h3>
        <ol>{g.steps.map((s) => <li key={s}>{s}</li>)}</ol>
        <h3>Tips</h3>
        <ul>{g.tips.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
    </div>
  )
}
