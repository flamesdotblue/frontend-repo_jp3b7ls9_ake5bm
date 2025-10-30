import { useState } from 'react'
import { Search } from 'lucide-react'

export default function SearchBar({ onSearch, status }) {
  const [query, setQuery] = useState('$.user.address.city')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by path e.g. $.items[0].name"
          className="w-full pl-9 pr-3 py-2 rounded-md border bg-white/80 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-emerald-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-emerald-700 transition"
      >
        Search
      </button>
      {status && (
        <span className={`text-sm ${status.found ? 'text-emerald-700' : 'text-red-600'}`}>
          {status.found ? 'Match found' : 'No match found'}
        </span>
      )}
    </form>
  )
}
