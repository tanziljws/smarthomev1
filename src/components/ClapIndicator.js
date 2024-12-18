'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ClapIndicator({ clapCount }) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (clapCount > 0) {
            setShow(true)
            const timer = setTimeout(() => setShow(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [clapCount])

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed bottom-8 right-8 bg-white rounded-full shadow-lg p-4
                             flex items-center gap-3"
                >
                    <span className="text-2xl">👏</span>
                    <div>
                        <div className="font-medium text-gray-800">
                            Clap Detected!
                        </div>
                        <div className="text-sm text-gray-500">
                            {clapCount} clap{clapCount > 1 ? 's' : ''}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
} 