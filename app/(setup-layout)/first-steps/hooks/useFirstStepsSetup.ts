import sellingOptionsData from '@/app/(setup-layout)/first-steps/data/selling-options.json';
import { useFormManager } from '@/app/(setup-layout)/first-steps/hooks/useFormManager';
import { useStepManager } from '@/app/(setup-layout)/first-steps/hooks/useStepManager';
import { useStoreCreation } from '@/app/(setup-layout)/first-steps/hooks/useStoreCreation';
import { useTemplateUpload } from '@/app/(setup-layout)/first-steps/hooks/useTemplateUpload';
import { useUserStoreData } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData';
import useAuthStore from '@/context/core/userStore';
import { routes } from '@/utils/client/routes';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useFirstStepsSetup = () => {
  const { user } = useAuthStore();
  const { createStoreWithTemplate } = useUserStoreData();
  const { uploadTemplate } = useTemplateUpload();

  const { step, setStep, nextStep, prevStep } = useStepManager({ initialStep: 1, maxStep: 3 });
  const { options } = sellingOptionsData;

  const { formData, updateFormData, validationErrors, validateStep, resetForm, setFormData } = useFormManager();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isStepValid, setIsStepValid] = useState(false);

  const { saving, uploadingTemplate, error, createStoreAndUploadTemplate, setError } = useStoreCreation({
    createStoreWithTemplate,
    uploadTemplate,
  });

  const cognitoUsername = user?.userId ?? null;

  const handleNextStep = async () => {
    if (step >= 2 && step <= 3) {
      if (!validateStep(step)) return;
    }
    if (step === 1 && selectedOption) {
      nextStep();
    } else if (step < 3) {
      nextStep();
    } else if (step === 3) {
      if (!cognitoUsername) return;

      const storeInput = {
        userId: cognitoUsername,
        storeId: `${uuidv4().slice(0, 7)}`,
        storeType: selectedOption || '',
        storeName: formData.storeName,
        storeDescription: formData.description,
        storeCurrency: 'COP',
        currencyFormat: '${{amount}}',
        currencyLocale: 'es-CO',
        currencyDecimalPlaces: 2,
        storeStatus: true,
        storeAdress: formData.location,
        contactEmail: formData.email,
        contactPhone: '',
        defaultDomain: `${formData.storeName.toLowerCase().replace(/\s+/g, '-')}.fasttify.com`,
        onboardingCompleted: true,
      };
      const templateInput = {
        storeName: formData.storeName,
        storeData: {
          theme: 'modern',
          currency: 'COP',
          description: formData.description,
          contactEmail: formData.email,
          contactPhone: '',
          storeAddress: formData.location,
          currencyFormat: '${{amount}}',
          currencyLocale: 'es-CO',
          currencyDecimalPlaces: 2,
        },
      };
      const result = await createStoreAndUploadTemplate(storeInput, templateInput);
      if (result) {
        window.location.href = routes.store.dashboard.main(result.store.storeId);
      }
    }
  };

  const handleQuickSetup = async () => {
    if (!cognitoUsername) return;
    setError(null);
    const quickStoreId = uuidv4();
    const storeIdShort = quickStoreId.slice(0, 7);
    const storeName = `Tienda ${storeIdShort}`;
    const quickStoreInput = {
      userId: cognitoUsername,
      storeId: storeIdShort,
      storeStatus: true,
      storeName: storeName,
      defaultDomain: `${storeName.toLowerCase().replace(/\s+/g, '-')}.fasttify.com`,
      storeType: 'quick-setup',
      storeCurrency: 'COP',
      currencyFormat: '${{amount}}',
      currencyLocale: 'es-CO',
      currencyDecimalPlaces: 2,
      onboardingCompleted: true,
    };
    const templateInput = {
      storeName: storeName,
      storeData: {
        theme: 'modern',
        currency: 'COP',
        description: 'Tienda creada con configuración rápida',
        currencyFormat: '${{amount}}',
        currencyLocale: 'es-CO',
        currencyDecimalPlaces: 2,
      },
    };
    const result = await createStoreAndUploadTemplate(quickStoreInput, templateInput);
    if (result) {
      window.location.href = routes.store.dashboard.main(result.store.storeId);
    }
  };

  const handleStepValidation = (isValid: boolean) => {
    setIsStepValid(isValid);
  };

  return {
    step,
    setStep,
    isStepValid,
    selectedOption,
    setSelectedOption,
    formData,
    updateFormData,
    validationErrors,
    saving,
    uploadingTemplate,
    options,
    nextStep: handleNextStep,
    handleQuickSetup,
    prevStep,
    handleStepValidation,
    error,
    resetForm,
    setFormData,
  };
};
