'use client'

import { motion } from 'framer-motion'

export function LoadingIndicator({ text }: { text: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo con efecto de desenfoque */}
      <div className="absolute inset-0 bg-white/30 backdrop-filter backdrop-blur-md" />

      {/* Contenido del indicador de carga */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1.2, 1, 1],
            rotate: [0, 0, 270, 270, 0],
            borderRadius: ['20%', '20%', '50%', '50%', '20%'],
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 0.5,
          }}
          className="w-16 h-16 bg-blue-500 mb-4 shadow-lg"
        />
        <motion.p
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
            repeat: Number.POSITIVE_INFINITY,
          }}
          className="text-black text-2xl font-medium"
        >
          {text}
        </motion.p>
      </div>
    </div>
  )
}
