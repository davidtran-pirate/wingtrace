import { useState, useEffect, useRef, useCallback } from 'react'

export const SPEED_OPTIONS = [
  { label: '0.25×', ms: 2000 },
  { label: '0.5×', ms: 1000 },
  { label: '1×', ms: 500 },
  { label: '2×', ms: 250 },
  { label: '4×', ms: 125 },
]

export function useAnimation(totalFrames: number) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(2) // default 1×
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const play = useCallback(() => {
    if (totalFrames === 0) return
    setIsPlaying(true)
  }, [totalFrames])

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, totalFrames - 1)))
  }, [totalFrames])

  const reset = useCallback(() => {
    stop()
    setCurrentIndex(0)
  }, [stop])

  useEffect(() => {
    if (!isPlaying || totalFrames === 0) return
    const ms = SPEED_OPTIONS[speedIndex].ms
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= totalFrames - 1) {
          stop()
          return prev
        }
        return prev + 1
      })
    }, ms)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, speedIndex, totalFrames, stop])

  // reset when totalFrames changes (new search)
  useEffect(() => {
    reset()
  }, [totalFrames, reset])

  return {
    currentIndex,
    isPlaying,
    speedIndex,
    setSpeedIndex,
    play,
    stop,
    goTo,
    reset,
    msPerFrame: SPEED_OPTIONS[speedIndex].ms,
  }
}
