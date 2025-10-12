import { useState } from 'react';

interface UseStepManagerProps {
  initialStep?: number;
  maxStep: number;
}

export const useStepManager = ({ initialStep = 1, maxStep }: UseStepManagerProps) => {
  const [step, setStep] = useState(initialStep);

  const nextStep = () => {
    setStep((prev) => (prev < maxStep ? prev + 1 : prev));
  };

  const prevStep = () => {
    setStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  return {
    step,
    setStep,
    nextStep,
    prevStep,
  };
};
