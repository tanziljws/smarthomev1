'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import WelcomeScreen from '@/components/WelcomeScreen'

export default function RootLayoutClient({ children }) {
  const { data: session } = useSession()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (session?.user && !localStorage.getItem('welcomed')) {
      setShowWelcome(true)
    }
  }, [session])

  const handleWelcomeComplete = () => {
    localStorage.setItem('welcomed', 'true')
    setShowWelcome(false)
  }

  return (
    <>
      <Navbar />
      {showWelcome && session?.user ? (
        <WelcomeScreen 
          user={session.user} 
          onComplete={handleWelcomeComplete} 
        />
      ) : (
        children
      )}
    </>
  )
} 