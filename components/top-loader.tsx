"use client"

import * as Progress from "@radix-ui/react-progress"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function TopLoader() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout

    // Start loading
    setVisible(true)
    setProgress(30)

    timer = setTimeout(() => setProgress(70), 200)

    // Finish loading
    const done = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 300)
    }, 500)

    return () => {
      clearTimeout(timer)
      clearTimeout(done)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <Progress.Root className="fixed top-0 left-0 w-full h-0.5 bg-muted z-50">
      <Progress.Indicator
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </Progress.Root>
  )
}