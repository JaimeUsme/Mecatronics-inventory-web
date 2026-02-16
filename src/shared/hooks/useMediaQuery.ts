import { useState, useEffect } from 'react'

/**
 * Returns true when the viewport matches the given media query.
 * Uses Tailwind's md breakpoint (768px) when query is 'md'.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = query === 'md' ? '(min-width: 768px)' : query
    const mql = window.matchMedia(mediaQuery)
    setMatches(mql.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
