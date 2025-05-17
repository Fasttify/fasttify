'use client'

import Lottie from 'lottie-react'

interface LottieWrapperProps {
  animationData: object
  loop?: boolean
}

export default function LottieWrapper({ animationData, loop = true }: LottieWrapperProps) {
  return <Lottie animationData={animationData} loop={loop} />
}
