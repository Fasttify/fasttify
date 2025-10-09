import { personalInfoSchema, storeInfoSchema } from '@/lib/zod-schemas/first-step';
import { useState } from 'react';

const initialFormData = {
  email: '',
  storeName: '',
  description: '',
  location: '',
  category: '',
};

export const useFormManager = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Record<string, any>>({});

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateStep = (step: number): boolean => {
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

  const resetForm = () => {
    setFormData(initialFormData);
    setValidationErrors({});
  };

  return {
    formData,
    updateFormData,
    validationErrors,
    validateStep,
    resetForm,
    setFormData,
  };
};
