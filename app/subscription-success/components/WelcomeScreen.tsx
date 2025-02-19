'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface WelcomeScreenProps {
  userName: string
  onAnimationComplete: () => void
}

export function WelcomeScreen({ userName, onAnimationComplete }: WelcomeScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onAnimationComplete()
    }, 2500)

    return () => clearTimeout(timer)
  }, [onAnimationComplete])

  const firstWord = userName.split(' ')[0]
  const lastWord = userName.split(' ').slice(1).join(' ')

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-6 px-4">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white"
            >
              {firstWord}
            </motion.span>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Image alt="fasttify-white" src="/icons/fasttify-white.webp" width={80} height={80} />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white"
            >
              {lastWord}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
