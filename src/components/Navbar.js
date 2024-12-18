'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
    const pathname = usePathname()
    
    const isActive = (path) => {
        return pathname === path ? "bg-blue-700" : ""
    }

    return (
        <nav className="bg-blue-600 text-white p-4">
            <div className="max-w-6xl mx-auto flex gap-4">
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
        </nav>
    )
} 