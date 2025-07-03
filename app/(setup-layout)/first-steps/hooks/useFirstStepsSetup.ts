import sellingOptionsData from '@/app/(setup-layout)/first-steps/data/selling-options.json';
import { useTemplateUpload } from '@/app/(setup-layout)/first-steps/hooks/useTemplateUpload';
import { useUserStoreData } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData';
import { useAuthUser } from '@/hooks/auth/useAuthUser';
import { personalInfoSchema, storeInfoSchema } from '@/lib/zod-schemas/first-step';
import { routes } from '@/utils/routes';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useFirstStepsSetup = () => {
  const [step, setStep] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Step 2
    fullName: '',
    email: '',

    // Step 3
    storeName: '',
    description: '',
    location: '',
    category: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const { userData } = useAuthUser();
  const { createStoreWithTemplate } = useUserStoreData();
  const { uploadTemplate } = useTemplateUpload();

  const cognitoUsername = userData?.['cognito:username'] ?? null;

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };
  const { options } = sellingOptionsData;

  const validateStep = (): boolean => {
    setValidationErrors({});
    let result;
    if (step === 2) {
      result = personalInfoSchema.safeParse(formData);
    } else if (step === 3) {
      result = storeInfoSchema.safeParse(formData);
    }

    if (result && !result.success) {
      setValidationErrors(result.error.flatten().fieldErrors);
      return false;
    }
    return true;
  };

  const nextStep = async () => {
    if (step >= 2 && step <= 3) {
      if (!validateStep()) return;
    }

    if (step === 1 && selectedOption) {
      setStep(2);
    } else if (step < 3) {
      setStep((prev) => prev + 1);
    } else if (step === 3) {
      setSaving(true);
      try {
        const storeInput = {
          userId: cognitoUsername,
          storeId: `${uuidv4().slice(0, 7)}`,
          storeType: selectedOption || '',
          storeName: formData.storeName,
          storeDescription: formData.description,
          storeCurrency: 'COP',
          storeStatus: true,
          storeAdress: formData.location,
          contactEmail: formData.email,
          contactPhone: '',
          contactName: formData.fullName,
          customDomain: `${formData.storeName.toLowerCase().replace(/\s+/g, '-')}.fasttify.com`,
          conctactIdentification: '',
          contactIdentificationType: '',
          onboardingCompleted: true,
        };

        const result = await createStoreWithTemplate(storeInput);
        if (result) {
          try {
            setUploadingTemplate(true);
            await uploadTemplate({
              storeId: result.store.storeId,
              storeName: formData.storeName,
              domain: storeInput.customDomain,
              storeData: {
                theme: 'modern',
                currency: 'COP',
                description: formData.description,
                contactEmail: formData.email,
                contactPhone: '',
                storeAddress: formData.location,
              },
            });
          } catch (templateError) {
            console.error('Error uploading template:', templateError);
          } finally {
            setUploadingTemplate(false);
          }

          setTimeout(() => {
            window.location.href = routes.store.dashboard.main(result.store.storeId);
          }, 3000);
        } else {
          setSaving(false);
        }
      } catch (error) {
        console.error('Error creating store:', error);
        setSaving(false);
      }
    }
  };

  const handleQuickSetup = async () => {
    if (!cognitoUsername) return;

    setSaving(true);
    const quickStoreId = uuidv4();
    const storeIdShort = quickStoreId.slice(0, 7);
    const storeName = `Tienda ${storeIdShort}`;

    const quickStoreInput = {
      userId: cognitoUsername,
      storeId: storeIdShort,
      storeStatus: true,
      storeName: storeName,
      customDomain: `${storeName.toLowerCase().replace(/\s+/g, '-')}.fasttify.com`,
      storeType: 'quick-setup',
      storeCurrency: 'COP',
      onboardingCompleted: true,
    };

    const result = await createStoreWithTemplate(quickStoreInput);

    if (result) {
      try {
        setUploadingTemplate(true);
        await uploadTemplate({
          storeId: result.store.storeId,
          storeName: storeName,
          domain: quickStoreInput.customDomain,
          storeData: {
            theme: 'modern',
            currency: 'COP',
            description: 'Tienda creada con configuración rápida',
          },
        });
      } catch (templateError) {
        console.error('Error uploading template:', templateError);
      } finally {
        setUploadingTemplate(false);
      }

      setTimeout(() => {
        window.location.href = routes.store.dashboard.main(result.store.storeId);
      }, 3000);
    } else {
      setSaving(false);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep((prev) => prev - 1);
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
    nextStep,
    handleQuickSetup,
    prevStep,
    handleStepValidation,
  };
};
