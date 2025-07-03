'use client';

import { BackgroundGradientAnimation } from '@/app/(setup-layout)/first-steps/components/BackgroundGradientAnimation';
import { MultiStepLoader } from '@/app/(setup-layout)/first-steps/components/MultiStepLoader';
import PersonalInfo from '@/app/(setup-layout)/first-steps/components/PersonalInfo';
import StoreInfo from '@/app/(setup-layout)/first-steps/components/StoreInfo';
import { useFirstStepsSetup } from '@/app/(setup-layout)/first-steps/hooks/useFirstStepsSetup';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, InfoIcon, Store, User } from 'lucide-react';
import Image from 'next/image';

export default function FirstStepsPage() {
  const {
    step,
    isStepValid,
    selectedOption,
    setSelectedOption,
    formData,
    validationErrors,
    saving,
    uploadingTemplate,
    updateFormData,
    options,
    nextStep,
    handleQuickSetup,
    prevStep,
    handleStepValidation,
  } = useFirstStepsSetup();

  if (uploadingTemplate || saving) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <MultiStepLoader
          loadingStates={[
            { text: 'Creando tu tienda...' },
            { text: 'Configurando el motor de plantillas...' },
            { text: 'Preparando todo para ti...' },
            { text: '¡Listo para empezar!' },
          ]}
          loading={true}
        />
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepWrapper key="step1">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">¿Dónde quieres vender con Fasttify?</h1>
              <p className="text-gray-600">
                Configuraremos todo para que puedas empezar a vender sin complicaciones donde elijas.
              </p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">¿Tienes prisa?</span> Usa la
                    <button
                      onClick={handleQuickSetup}
                      className="mx-1 font-medium text-blue-600 underline hover:text-blue-800">
                      configuración rápida
                    </button>
                    y crea tu tienda al instante. Podrás personalizarla más tarde.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`p-6 rounded-xl text-left transition-all ${
                    selectedOption === option.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex-shrink-0 transition-colors ${
                        selectedOption === option.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                      {selectedOption === option.id && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-full h-full text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </motion.svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </StepWrapper>
        );
      case 2:
        return (
          <StepWrapper key="step2">
            <PersonalInfo data={formData} updateData={updateFormData} errors={validationErrors} />
          </StepWrapper>
        );
      case 3:
        return (
          <StepWrapper key="step3">
            <StoreInfo
              data={formData}
              updateData={updateFormData}
              errors={validationErrors}
              onValidationChange={handleStepValidation}
            />
          </StepWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <Image src="/icons/fasttify-white.webp" priority={true} alt="Fasttify Logo" width={50} height={50} />
      </div>
      <div className="absolute inset-0 z-0 sm:block hidden">
        <BackgroundGradientAnimation />
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-3xl bg-white  backdrop-blur-sm rounded-3xl border shadow-lg p-8 relative">
          {step > 1 && (
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    step >= 2 ? 'bg-blue-500 text-white' : 'bg-white'
                  }`}>
                  <User size={20} />
                </div>
                <div className="h-1 w-12 bg-white rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: '0%' }}
                    animate={{ width: step >= 3 ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    step >= 3 ? 'bg-blue-500 text-white' : 'bg-white'
                  }`}>
                  <Store size={20} />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-500">Paso {step} de 3</span>
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {renderStep()}
          </AnimatePresence>

          <div className="mt-8 flex justify-between items-center">
            {step === 1 ? (
              <button
                onClick={handleQuickSetup}
                disabled={saving}
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                No necesito ayuda →
              </button>
            ) : (
              <Button variant="ghost" onClick={prevStep} disabled={saving}>
                Atrás
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={nextStep}
              disabled={(step === 1 && !selectedOption) || (step === 3 && !isStepValid) || saving}
              className="rounded-lg">
              {saving ? 'Creando tienda...' : step === 3 ? 'Finalizar y crear tienda' : 'Siguiente'}
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const StepWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ x: 300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -300, opacity: 0 }}
    transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}>
    {children}
  </motion.div>
);
