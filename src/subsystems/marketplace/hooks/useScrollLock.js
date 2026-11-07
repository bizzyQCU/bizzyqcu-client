import { useEffect } from 'react'

let locks = 0

export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return
    if (locks++ === 0) document.body.style.overflow = 'hidden'
    return () => {
      if (--locks === 0) document.body.style.overflow = ''
    }
  }, [active])
}
