import { useState } from 'react'

const sample = {
  user: {
    id: 123,
    name: 'Ada Lovelace',
    active: true,
    address: { city: 'London', zip: 'EC1A' },
  },
  items: [
    { name: 'notebook', price: 9.99 },
    { name: 'pencil', price: 1.25 },
  ],
  meta: null,
}

export default function JsonInput({ onValidJson }) {
  const [text, setText] = useState(JSON.stringify(sample, null, 2))
  const [error, setError] = useState('')

  const handleVisualize = () => {
    try {
      const parsed = JSON.parse(text)
      setError('')
      onValidJson(parsed, text)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="w-full grid grid-cols-1 gap-3">
      <label className="text-sm font-medium text-gray-700">JSON Input</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[220px] w-full rounded-lg border bg-white/80 p-3 font-mono text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Paste your JSON here"
      />
      {error ? (
        <div className="text-red-600 text-sm">Invalid JSON: {error}</div>
      ) : (
        <div className="text-emerald-600 text-sm">JSON looks good</div>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={handleVisualize}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow hover:bg-blue-700 transition"
        >
          Visualize
        </button>
        <button
          onClick={() => {
            setText(JSON.stringify(sample, null, 2))
            setError('')
          }}
          className="inline-flex items-center justify-center rounded-md bg-gray-200 px-3 py-2 text-gray-800 font-medium hover:bg-gray-300 transition"
        >
          Load Sample
        </button>
      </div>
    </div>
  )
}
