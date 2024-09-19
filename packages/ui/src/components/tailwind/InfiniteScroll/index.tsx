import React, { useEffect, useRef } from 'react'

interface IInfiniteScrollProps {
  onScrollBottom: () => void
  children: React.ReactNode
  disableEvent?: boolean
  threshold?: number
  className?: string
}

export default function InfiniteScroll({
  onScrollBottom,
  threshold = 1,
  disableEvent,
  children
}: IInfiniteScrollProps) {
  const observerRef = useRef<HTMLElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !disableEvent) {
          onScrollBottom()
          intervalRef.current = setInterval(() => onScrollBottom(), 1000)
        } else {
          clearInterval(intervalRef.current)
        }
      },
      { threshold }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [disableEvent])

  return (
    <div style={{ all: 'unset' }}>
      {children}
      <span ref={observerRef} style={{ all: 'unset' }} />
    </div>
  )
}
