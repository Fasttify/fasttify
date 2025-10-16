import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Amplify } from 'aws-amplify';
import { type StoreSchema } from '../../../data/resource';
import { CognitoUserAttribute, UserService } from '../types';
import { env } from '$amplify/env/hookPlan';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const cognitoClient = new CognitoIdentityProviderClient();
const dynamoClient = generateClient<StoreSchema>();

export class CognitoUserService implements UserService {
  constructor(private readonly userPoolId: string) {}

  /**
   * Gets user from Cognito by username
   */
  async getCognitoUser(userId: string) {
    try {
      const response = await cognitoClient.send(
        new AdminGetUserCommand({
          UserPoolId: this.userPoolId,
          Username: userId,
        })
      );

      return response;
    } catch (error) {
      console.error(`Error fetching Cognito user ${userId}:`, error);
      throw new Error(`Failed to fetch user: ${userId}`);
    }
  }

  /**
   * Gets current user plan from Cognito attributes
   */
  getCurrentPlan(userAttributes: CognitoUserAttribute[] = []): string {
    const planAttribute = userAttributes.find((attr) => attr.Name === 'custom:plan');
    return planAttribute?.Value || 'free';
  }

  /**
   * Updates user plan in Cognito
   */
  async updateUserPlan(userId: string, planName: string): Promise<void> {
    try {
      await cognitoClient.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: this.userPoolId,
          Username: userId,
          UserAttributes: [
            {
              Name: 'custom:plan',
              Value: planName,
            },
          ],
        })
      );

      // Update storeStatus based on the plan type
      await this.updateUserStoresStatus(userId, planName);
    } catch (error) {
      console.error(`Error updating user plan for ${userId}:`, error);
      throw new Error(`Failed to update user plan: ${userId}`);
    }
  }

  /**
   * Updates all user stores status based on plan type
   */
  private async updateUserStoresStatus(userId: string, planName: string): Promise<void> {
    try {
      const isFreePlan = planName.toLowerCase() === 'free';
      const newStoreStatus = !isFreePlan; // false for free plan, true for paid plans

      // Get all user stores
      const userStoresResponse = await dynamoClient.models.UserStore.listUserStoreByUserId({
        userId: userId,
      });

      const userStores = userStoresResponse.data || [];

      // Update storeStatus of all user stores
      for (const store of userStores) {
        try {
          await dynamoClient.models.UserStore.update({
            storeId: store.storeId,
            storeStatus: newStoreStatus,
          });
        } catch (storeUpdateError) {
          console.error(`Error updating store ${store.storeId} status:`, storeUpdateError);
        }
      }
    } catch (error) {
      console.error(`Error updating stores status for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Downgrades user to free plan after subscription cancellation
   */
  async downgradeUser(userId: string): Promise<void> {
    try {
      const cognitoUser = await this.getCognitoUser(userId);
      const currentPlan = this.getCurrentPlan(cognitoUser.UserAttributes);

      if (currentPlan === 'free') {
        // Update stores status even if the user already has a free plan
        await this.updateUserStoresStatus(userId, 'free');
        return;
      }

      // Calculate remaining subscription time
      const existingSubscription = await this.getExistingSubscription(userId);

      if (existingSubscription) {
        await this.handleSubscriptionCancellation(userId, existingSubscription);
      }

      await this.updateUserPlan(userId, 'free');
    } catch (error) {
      console.error(`Error downgrading user ${userId}:`, error);
      throw new Error(`Failed to downgrade user: ${userId}`);
    }
  }

  /**
   * Gets existing subscription from DynamoDB
   */
  private async getExistingSubscription(userId: string) {
    try {
      const response = await dynamoClient.models.UserSubscription.get({
        id: userId,
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Handles subscription cancellation logic
   */
  private async handleSubscriptionCancellation(userId: string, subscription: any) {
    try {
      // Calculate pending plan based on remaining time
      const pendingPlan = this.calculatePendingPlan(subscription);

      if (pendingPlan !== 'free') {
        await dynamoClient.models.UserSubscription.update({
          id: userId,
          pendingPlan,
        });
      }
    } catch (error) {
      console.error('Error handling subscription cancellation:', error);
    }
  }

  /**
   * Calculates pending plan based on remaining subscription time
   */
  private calculatePendingPlan(subscription: any): string {
    return 'free'; // Simplified for now
  }

  /**
   * Creates or updates subscription in DynamoDB
   */
  async updateSubscription(
    userId: string,
    subscriptionData: {
      subscriptionId?: string;
      planName: string;
      nextPaymentDate?: string;
      lastFourDigits?: number;
    }
  ): Promise<void> {
    try {
      if (!subscriptionData.subscriptionId) {
        throw new Error('subscriptionId is required');
      }

      // Check if subscription already exists
      const existingSubscription = await this.getExistingSubscription(userId);

      const subscriptionPayload = {
        id: userId,
        userId: userId,
        subscriptionId: subscriptionData.subscriptionId,
        planName: subscriptionData.planName,
        nextPaymentDate: subscriptionData.nextPaymentDate,
        lastFourDigits: subscriptionData.lastFourDigits,
        pendingPlan: null,
      };

      if (existingSubscription) {
        // Update existing record
        await dynamoClient.models.UserSubscription.update(subscriptionPayload);
      } else {
        // Create new record
        await dynamoClient.models.UserSubscription.create(subscriptionPayload);
      }

      // Update storeStatus based on the new plan
      await this.updateUserStoresStatus(userId, subscriptionData.planName);
    } catch (error) {
      console.error(`Error saving subscription for ${userId}:`, error);
      console.error('Subscription data:', JSON.stringify(subscriptionData, null, 2));
      throw new Error(`Failed to save subscription: ${userId}`);
    }
  }
}
