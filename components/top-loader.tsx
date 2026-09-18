"use client"

import * as Progress from "@radix-ui/react-progress"
import { useEffect, useState, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export default function TopLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Listen for navigation completions
  useEffect(() => {
    if (visible) {
      setProgress(100)
      const timeout = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 250)
      return () => clearTimeout(timeout)
    }
  }, [pathname, searchParams])

  // Listen for instant clicks on internal links to start loader immediately
  useEffect(() => {
    function handleAnchorClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Skip external links, hash anchors, same page, or new tabs
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target.getAttribute('target') === '_blank' ||
        target.getAttribute('download') !== null
      ) {
        return
      }

      // Check if it's an internal route that differs from current path
      const currentFull = window.location.pathname + window.location.search
      if (href === currentFull || href === window.location.pathname) {
        return
      }

      // Start loader immediately
      setVisible(true)
      setProgress(25)

      if (timerRef.current) clearInterval(timerRef.current)

      timerRef.current = setTimeout(() => {
        setProgress((prev) => (prev < 80 ? prev + 35 : prev))
      }, 150)
    }

    document.addEventListener('click', handleAnchorClick)
    return () => {
      document.removeEventListener('click', handleAnchorClick)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <Progress.Root className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-[9999] pointer-events-none">
      <Progress.Indicator
        className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 shadow-[0_0_8px_rgba(20,184,166,0.6)] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </Progress.Root>
  )
}