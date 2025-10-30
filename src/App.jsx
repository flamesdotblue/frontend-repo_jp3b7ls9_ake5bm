import { useRef, useState } from 'react'
import Hero from './components/Hero'
import JsonInput from './components/JsonInput'
import SearchBar from './components/SearchBar'
import TreeCanvas from './components/TreeCanvas'

function App() {
  const canvasRef = useRef(null)
  const [data, setData] = useState(null)
  const [highlightedId, setHighlightedId] = useState(null)
  const [status, setStatus] = useState(null)
  const [rawText, setRawText] = useState('')

  const handleValidJson = (parsed, text) => {
    setData(parsed)
    setRawText(text)
    setHighlightedId(null)
    setStatus(null)
    // Fit all after render via small timeout
    setTimeout(() => canvasRef.current?.fitAll?.(), 50)
  }

  const handleSearch = (pathQuery) => {
    if (!data || !canvasRef.current) return

    const normalized = normalizePath(pathQuery)
    const id = canvasRef.current.focusNodeByPath(normalized)
    if (id) {
      setHighlightedId(id)
      setStatus({ found: true })
    } else {
      setStatus({ found: false })
    }
  }

  const handleExport = async () => {
    // Use a simple timestamped filename
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    await canvasRef.current?.exportAsPng?.(`json-tree-${ts}.png`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <Hero />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <JsonInput onValidJson={handleValidJson} />
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Search by JSON Path</h3>
              <SearchBar onSearch={handleSearch} status={status} />
              <p className="text-xs text-gray-500">
                Examples: $.user.address.city • $.items[0].name • $.meta
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Visualization</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => canvasRef.current?.zoomOut?.()} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">-
                </button>
                <button onClick={() => canvasRef.current?.fitAll?.()} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
                  Fit
                </button>
                <button onClick={() => canvasRef.current?.zoomIn?.()} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">+
                </button>
                <button onClick={handleExport} className="rounded-md bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium shadow hover:bg-indigo-700 transition">
                  Export PNG
                </button>
              </div>
            </div>
            <TreeCanvas ref={canvasRef} data={data} highlightedId={highlightedId} />
            <div className="text-xs text-gray-500">
              • Drag to pan • Scroll to zoom • Hover nodes to view path via label • Colors: Objects (blue), Arrays (green), Primitives (amber)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Normalize various path syntaxes to a consistent form starting with $
function normalizePath(input) {
  let s = (input || '').trim()
  if (!s) return ''
  if (!s.startsWith('$')) s = `$${s}`
  // Remove accidental double dots
  s = s.replace(/\.+/g, '.')
  // Remove trailing dots
  s = s.replace(/\.$/, '')
  return s
}

export default App
