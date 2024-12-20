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
        return pathname === path
    }

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo dan Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <svg className="h-8 w-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="ml-2 text-xl font-bold">SmartHome</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden sm:flex sm:space-x-4">
                        {[
                            { name: 'Dashboard', href: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                            { name: 'CCTV', href: '/cctv', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                            { name: 'Devices', href: '/devices', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
                        ].map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                    ${isActive(item.href)
                                        ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/20'
                                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* User Menu */}
                    {session?.user && (
                        <div className="relative ml-4 z-50">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 px-4 py-2 rounded-lg
                                         bg-white/10 hover:bg-white/20 transition-all duration-200
                                         border border-white/20 backdrop-blur-sm"
                            >
                                <img
                                    src={session.user.image || '/default-avatar.png'}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full ring-2 ring-white/30"
                                />
                                <span className="text-sm font-medium">{session.user.name}</span>
                                <svg className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl
                                                 shadow-lg ring-1 ring-black ring-opacity-5 py-1
                                                 backdrop-blur-sm divide-y divide-gray-100
                                                 z-50"
                                    >
                                        <div className="px-4 py-3">
                                            <p className="text-sm text-gray-900">Signed in as</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {session.user.email}
                                            </p>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                href="/profile"
                                                onClick={() => setShowUserMenu(false)}
                                                className="group flex items-center px-4 py-2 text-sm text-gray-700
                                                         hover:bg-gray-50 cursor-pointer w-full"
                                            >
                                                <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Profile Settings
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false)
                                                    signOut()
                                                }}
                                                className="group flex w-full items-center px-4 py-2 text-sm
                                                         text-red-700 hover:bg-red-50 cursor-pointer"
                                            >
                                                <svg className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500"
                                                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
