import { useEffect, useState } from 'react'

let cached = null

const getStats = async () => {
  if (cached) return cached
  const res = await fetch('/api/stats')
  if (!res.ok) throw new Error('Failed to load stats')
  cached = await res.json()
  return cached
}

export const useStats = () => {
  const [stats, setStats] = useState(cached || null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    getStats()
      .then(data => {
        if (active) setStats(data)
      })
      .catch(err => {
        if (active) setError(err.message)
      })
    return () => { active = false }
  }, [])

  return { stats, error }
}
