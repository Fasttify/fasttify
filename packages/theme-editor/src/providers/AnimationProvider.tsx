import { createContext, useContext, ReactNode } from 'react';

interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: string;
  direction?: 'top' | 'bottom' | 'left' | 'right';
  distance?: number;
}

interface AnimationContextType {
  getAnimationClasses: (config: AnimationConfig) => string;
  getStaggeredAnimation: (index: number, baseConfig: AnimationConfig) => string;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

interface AnimationProviderProps {
  children: ReactNode;
}

export const AnimationProvider = ({ children }: AnimationProviderProps) => {
  const getAnimationClasses = (config: AnimationConfig) => {
    const { duration, delay = 0, easing = 'ease-out', direction = 'bottom', distance = 4 } = config;

    const directionMap = {
      top: 'slide-in-from-top',
      bottom: 'slide-in-from-bottom',
      left: 'slide-in-from-left',
      right: 'slide-in-from-right',
    };

    const delayClass = delay > 0 ? `delay-${delay}` : '';
    const durationClass = `duration-${duration}`;
    const easingClass = `ease-${easing}`;
    const directionClass = `${directionMap[direction]}-${distance}`;

    return `animate-in fade-in-0 ${directionClass} ${durationClass} ${easingClass} ${delayClass}`.trim();
  };

  const getStaggeredAnimation = (index: number, baseConfig: AnimationConfig) => {
    const delay = (baseConfig.delay || 0) + index * 100;
    return getAnimationClasses({ ...baseConfig, delay });
  };

  const value = {
    getAnimationClasses,
    getStaggeredAnimation,
  };

  return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
};
