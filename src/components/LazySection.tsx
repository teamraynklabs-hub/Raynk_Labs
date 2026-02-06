'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'

interface LazySectionProps {
  children: ReactNode
  /** CSS min-height for the placeholder before the section loads */
  minHeight?: string
  /** How far before the viewport to trigger loading (CSS margin syntax) */
  rootMargin?: string
}

/**
 * Wraps a section so it only mounts when the user scrolls near it.
 * Uses IntersectionObserver with a rootMargin so the component
 * starts loading ~10% before it enters the viewport.
 * Once loaded, it stays mounted permanently.
 */
export default function LazySection({
  children,
  minHeight = '200px',
  rootMargin = '0px 0px 10% 0px',
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref} style={{ minHeight: visible ? undefined : minHeight }}>
      {visible ? children : null}
    </div>
  )
}
