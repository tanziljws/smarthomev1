'use client'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LoadingBar() {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleComplete = () => setLoading(false)

    handleStart()
    
    const timer = setTimeout(handleComplete, 500)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  if (!loading) return null

  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-50"
    />
  )
} 