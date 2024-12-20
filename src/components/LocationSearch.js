'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { searchLocation } from '@/lib/weathers/weather'
import { FiSearch, FiMapPin, FiClock, FiNavigation, FiX } from 'react-icons/fi'
import debounce from 'lodash/debounce'

export default function LocationSearch({ onLocationSelect, currentLocation }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [error, setError] = useState(null)
  const searchRef = useRef(null)

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }

    // Click outside handler
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const debouncedSearch = debounce(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const searchResults = await searchLocation(searchQuery)
      setResults(searchResults)
    } catch (err) {
      setError('Gagal mencari lokasi. Silakan coba lagi.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, 500)

  const handleSearch = (e) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(true)
    debouncedSearch(value)
  }

  const handleLocationSelect = (location) => {
    // Tambahkan informasi timezone ke lokasi
    const enrichedLocation = {
      ...location,
      timezone: location.timezone || 'UTC', // fallback ke UTC jika tidak ada timezone
      offset: new Date().toLocaleString('en-US', {
        timeZone: location.timezone,
        timeZoneName: 'short'
      }).split(' ').pop() // Mendapatkan offset timezone (e.g., EDT, PST)
    }

    // Update recent searches dengan timezone
    const newRecentSearches = [
      enrichedLocation,
      ...recentSearches.filter(item => item.id !== location.id)
    ].slice(0, 5)

    setRecentSearches(newRecentSearches)
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches))

    onLocationSelect(enrichedLocation)
    setQuery(location.name)
    setIsOpen(false)
  }

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            const results = await searchLocation(`${latitude},${longitude}`)
            if (results.length > 0) {
              handleLocationSelect(results[0])
            }
          } catch (err) {
            setError('Gagal mendapatkan lokasi saat ini.')
          } finally {
            setLoading(false)
          }
        },
        (err) => {
          setError('Izin lokasi ditolak.')
          setLoading(false)
        }
      )
    } else {
      setError('Geolokasi tidak didukung di browser ini.')
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          onFocus={() => setIsOpen(true)}
          placeholder="Cari kota atau tempat..."
          className="w-full px-4 py-3 pl-12 pr-10 rounded-xl
                   bg-white/80 backdrop-blur-md border border-gray-200
                   focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                   transition-all duration-200"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400
                     hover:text-gray-600 transition-colors"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl
                     border border-gray-100 overflow-hidden"
          >
            {/* Current Location Button */}
            <div className="p-2 border-b border-gray-100">
              <button
                onClick={handleUseCurrentLocation}
                className="w-full px-4 py-3 flex items-center gap-3 text-left
                         hover:bg-blue-50 rounded-lg transition-colors group"
              >
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600
                            group-hover:bg-blue-200 transition-colors">
                  <FiNavigation />
                </div>
                <span className="font-medium text-gray-700">
                  Gunakan Lokasi Saat Ini
                </span>
              </button>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-2 border-b border-gray-100">
                <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
                  <FiClock />
                  <span>Pencarian Terakhir</span>
                </div>
                {recentSearches.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left
                             hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiMapPin className="text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-700">
                        {location.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {location.country}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Search Results */}
            <div className="max-h-64 overflow-y-auto p-2">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
              ) : results.length > 0 ? (
                results.map((result) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => handleLocationSelect(result)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left
                             hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiMapPin className="text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">
                        {result.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{result.country}</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {result.timezone}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date().toLocaleTimeString('id-ID', {
                        timeZone: result.timezone,
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </motion.button>
                ))
              ) : query && !loading ? (
                <div className="p-4 text-center text-gray-500">
                  Tidak ada hasil ditemukan
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
