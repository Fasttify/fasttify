"use client";

import { useState } from "react";
import {
  updateUserAttributes,
  confirmUserAttribute,
  sendUserAttributeVerificationCode,
  type UpdateUserAttributesOutput,
  type ConfirmUserAttributeInput,
  type VerifiableUserAttributeKey,
} from "aws-amplify/auth";

interface UseUserAttributesReturn {
  updateAttributes: (
    attributes: Record<string, string>
  ) => Promise<UpdateUserAttributesOutput>;
  confirmAttribute: (params: {
    userAttributeKey: string;
    confirmationCode: string;
  }) => Promise<void>;
  sendVerificationCode: (
    userAttributeKey: VerifiableUserAttributeKey
  ) => Promise<void>;
  loading: boolean;
  error: unknown;
  nextStep: string | null;
  codeDeliveryDetails: any;
}

export function useUserAttributes(): UseUserAttributesReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [nextStep, setNextStep] = useState<string | null>(null);
  const [codeDeliveryDetails, setCodeDeliveryDetails] = useState<any>(null);

  async function updateAttributes(
    attributes: Record<string, string>
  ): Promise<UpdateUserAttributesOutput> {
    setLoading(true);
    setError(null);
    try {
      const output = await updateUserAttributes({ userAttributes: attributes });
      if (
        output.nextStep &&
        (output.nextStep as any).updateAttributeStep ===
          "CONFIRM_ATTRIBUTE_WITH_CODE"
      ) {
        setNextStep("CONFIRM_ATTRIBUTE_WITH_CODE");
        setCodeDeliveryDetails((output.nextStep as any).codeDeliveryDetails);
      } else {
        setNextStep("DONE");
      }
      return output;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function confirmAttribute({
    userAttributeKey,
    confirmationCode,
  }: {
    userAttributeKey: string;
    confirmationCode: string;
  }): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      await confirmUserAttribute({
        userAttributeKey,
        confirmationCode,
      } as ConfirmUserAttributeInput);
      setNextStep("DONE");
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function sendVerificationCode(
    userAttributeKey: VerifiableUserAttributeKey
  ): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      await sendUserAttributeVerificationCode({ userAttributeKey });
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    updateAttributes,
    confirmAttribute,
    sendVerificationCode,
    loading,
    error,
    nextStep,
    codeDeliveryDetails,
  };
}
