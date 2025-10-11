import { useState } from 'react';
import { useStoreLimitsValidator } from './useStoreLimitsValidator';

interface StoreInput {
  userId: string;
  storeId: string;
  storeType: string;
  storeName: string;
  storeDescription?: string;
  storeCurrency: string;
  storeStatus: boolean;
  storeAdress?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactName?: string;
  defaultDomain: string;
  conctactIdentification?: string;
  contactIdentificationType?: string;
  onboardingCompleted: boolean;
}

interface UploadTemplateInput {
  storeId: string;
  storeName: string;
  domain: string;
  storeData: Record<string, any>;
}

interface UseStoreCreationProps {
  createStoreWithTemplate: (input: StoreInput) => Promise<any>;
  uploadTemplate: (input: UploadTemplateInput) => Promise<any>;
}

export const useStoreCreation = ({ createStoreWithTemplate, uploadTemplate }: UseStoreCreationProps) => {
  const [saving, setSaving] = useState(false);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { validateLimits } = useStoreLimitsValidator();

  const createStoreAndUploadTemplate = async (
    storeInput: StoreInput,
    templateInput: Omit<UploadTemplateInput, 'storeId' | 'domain'> & { domain?: string }
  ) => {
    setSaving(true);
    setError(null);
    try {
      // Validar límites antes de crear la tienda
      const canCreate = await validateLimits();
      if (!canCreate) {
        throw new Error('You have reached the limit of stores for your current plan');
      }

      const result = await createStoreWithTemplate(storeInput);
      if (result) {
        try {
          setUploadingTemplate(true);
          await uploadTemplate({
            storeId: result.store.storeId,
            storeName: templateInput.storeName,
            domain: storeInput.defaultDomain,
            storeData: templateInput.storeData,
          });
        } catch (templateError) {
          setError('Error subiendo la plantilla');
          console.error('Error uploading template:', templateError);
        } finally {
          setUploadingTemplate(false);
        }
        return result;
      } else {
        setError('No se pudo crear la tienda');
        setSaving(false);
        return null;
      }
    } catch (err) {
      setError('Error creando la tienda');
      setSaving(false);
      console.error('Error creating store:', err);
      return null;
    }
  };

  return {
    saving,
    uploadingTemplate,
    error,
    createStoreAndUploadTemplate,
    setError,
  };
};
