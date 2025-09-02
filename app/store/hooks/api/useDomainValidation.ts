import { useState } from 'react';

interface ValidationState {
  isLoading: boolean;
  error: string | null;
  validationToken: string | null;
  instructions: string | null;
  isValidated: boolean;
  validationMethod: 'dns' | 'http' | null;
  // Nuevos campos para ACM
  certificateArn: string | null;
  certificateStatus: 'ISSUED' | 'PENDING_VALIDATION' | 'FAILED' | null;
  acmValidationRecords: Array<{ name: string; value: string; type: string }>;
  needsACMValidation: boolean;
  isCertificateReady: boolean;
}

export function useDomainValidation() {
  const [state, setState] = useState<ValidationState>({
    isLoading: false,
    error: null,
    validationToken: null,
    instructions: null,
    isValidated: false,
    validationMethod: null,
    certificateArn: null,
    certificateStatus: null,
    acmValidationRecords: [],
    needsACMValidation: false,
    isCertificateReady: false,
  });

  const generateValidationToken = async (domain: string, storeId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/domain-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, storeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error generating validation token');
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        validationToken: data.validationToken,
        instructions: data.instructions,
        error: null,
      }));

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const verifyDomainValidation = async (domain: string, validationToken: string, storeId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/domain-validation/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, validationToken, storeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error verifying domain');
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        isValidated: true,
        validationMethod: data.method,
        certificateArn: data.certificateArn,
        certificateStatus: data.certificateStatus,
        acmValidationRecords: data.acmValidationRecords || [],
        needsACMValidation: data.needsACMValidation || false,
        isCertificateReady: data.certificateStatus === 'ISSUED',
        error: null,
      }));

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const resetValidation = () => {
    setState({
      isLoading: false,
      error: null,
      validationToken: null,
      instructions: null,
      isValidated: false,
      validationMethod: null,
      certificateArn: null,
      certificateStatus: null,
      acmValidationRecords: [],
      needsACMValidation: false,
      isCertificateReady: false,
    });
  };

  const verifyACMCertificate = async (certificateArn: string, storeId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/domain-validation/verify-acm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateArn, storeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error verifying ACM certificate');
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        isCertificateReady: data.isReady,
        certificateStatus: data.status,
        error: null,
      }));

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...state,
    generateValidationToken,
    verifyDomainValidation,
    verifyACMCertificate,
    resetValidation,
  };
}
