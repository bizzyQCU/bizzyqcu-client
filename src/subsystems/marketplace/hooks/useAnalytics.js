import { useEffect, useState, useCallback } from 'react'
import { analytics } from '../data/analyticsMock'

export function useAnalytics(range) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Stringify range to avoid infinite loop from object reference changes
  const rangeKey = JSON.stringify(range)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/analytics?start=${range.start}&end=${range.end}`)
      await new Promise(r => setTimeout(r, 300))
      setData(analytics)
      setError(null)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [rangeKey]) // Use stringified version to avoid infinite loop

  useEffect(() => { 
    load() 
  }, [load])

  return { data, loading, error, refresh: load }
}
