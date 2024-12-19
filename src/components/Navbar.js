'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [showUserMenu, setShowUserMenu] = useState(false)
    
    const isActive = (path) => {
        return pathname === path ? "bg-blue-700" : ""
    }

    return (
        <nav className="bg-blue-600 text-white p-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex gap-4">
                    <Link href="/" 
                        className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/')}`}>
                        Dashboard
                    </Link>
                    <Link href="/cctv" 
                        className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/cctv')}`}>
                        CCTV
                    </Link>
                    <Link href="/devices" 
                        className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/devices')}`}>
                        Devices
                    </Link>
                </div>

                {session?.user && (
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg 
                                     hover:bg-blue-700 transition-colors"
                        >
                            <img
                                src={session.user.image || '/default-avatar.png'}
                                alt="Profile"
                                className="w-8 h-8 rounded-full"
                            />
                            <span>{session.user.name}</span>
                        </button>

                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl 
                                             shadow-lg py-2 text-gray-800"
                                >
                                    <Link href="/profile"
                                        className="block px-4 py-2 hover:bg-gray-100"
                                    >
                                        Profile Settings
                                    </Link>
                                    <button
                                        onClick={() => signOut()}
                                        className="block w-full text-left px-4 py-2 
                                                 hover:bg-gray-100 text-red-600"
                                    >
                                        Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </nav>
    )
} 