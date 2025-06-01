import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { Amplify } from 'aws-amplify'
import { type Schema } from '../../../data/resource'
import { CognitoUserAttribute, UserService } from '../types'
import { env } from '$amplify/env/hookPlan'

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
Amplify.configure(resourceConfig, libraryOptions)

const cognitoClient = new CognitoIdentityProviderClient()
const dynamoClient = generateClient<Schema>()

export class CognitoUserService implements UserService {
  constructor(private readonly userPoolId: string) {}

  /**
   * Gets user from Cognito by username
   */
  async getCognitoUser(userId: string) {
    try {
      console.log(`🔍 Fetching Cognito user: ${userId}`)

      const response = await cognitoClient.send(
        new AdminGetUserCommand({
          UserPoolId: this.userPoolId,
          Username: userId,
        })
      )

      console.log(`✅ Cognito user retrieved successfully`)
      return response
    } catch (error) {
      console.error(`❌ Error fetching Cognito user ${userId}:`, error)
      throw new Error(`Failed to fetch user: ${userId}`)
    }
  }

  /**
   * Gets current user plan from Cognito attributes
   */
  getCurrentPlan(userAttributes: CognitoUserAttribute[] = []): string {
    const planAttribute = userAttributes.find(attr => attr.Name === 'custom:plan')
    return planAttribute?.Value || 'free'
  }

  /**
   * Updates user plan in Cognito
   */
  async updateUserPlan(userId: string, planName: string): Promise<void> {
    try {
      console.log(`🔄 Updating user ${userId} to plan: ${planName}`)

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
      )

      console.log(`✅ User plan updated successfully`)
    } catch (error) {
      console.error(`❌ Error updating user plan for ${userId}:`, error)
      throw new Error(`Failed to update user plan: ${userId}`)
    }
  }

  /**
   * Downgrades user to free plan after subscription cancellation
   */
  async downgradeUser(userId: string): Promise<void> {
    try {
      console.log(`⬇️ Downgrading user ${userId} to free plan`)

      const cognitoUser = await this.getCognitoUser(userId)
      const currentPlan = this.getCurrentPlan(cognitoUser.UserAttributes)

      if (currentPlan === 'free') {
        console.log('🔍 User already has free plan, no changes needed')
        return
      }

      // Calculate remaining subscription time
      const existingSubscription = await this.getExistingSubscription(userId)

      if (existingSubscription) {
        await this.handleSubscriptionCancellation(userId, existingSubscription)
      }

      await this.updateUserPlan(userId, 'free')

      console.log(`✅ User successfully downgraded to free plan`)
    } catch (error) {
      console.error(`❌ Error downgrading user ${userId}:`, error)
      throw new Error(`Failed to downgrade user: ${userId}`)
    }
  }

  /**
   * Gets existing subscription from DynamoDB
   */
  private async getExistingSubscription(userId: string) {
    try {
      const response = await dynamoClient.models.UserSubscription.get({
        id: userId,
      })
      return response.data
    } catch (error) {
      console.log(`ℹ️ No existing subscription found for user: ${userId}`)
      return null
    }
  }

  /**
   * Handles subscription cancellation logic
   */
  private async handleSubscriptionCancellation(userId: string, subscription: any) {
    try {
      // Calculate pending plan based on remaining time
      const pendingPlan = this.calculatePendingPlan(subscription)

      if (pendingPlan !== 'free') {
        await dynamoClient.models.UserSubscription.update({
          id: userId,
          pendingPlan,
        })

        console.log(`⏰ Pending plan set to: ${pendingPlan}`)
      }
    } catch (error) {
      console.error('❌ Error handling subscription cancellation:', error)
    }
  }

  /**
   * Calculates pending plan based on remaining subscription time
   */
  private calculatePendingPlan(subscription: any): string {
    // Add your logic here to calculate pending plan
    // based on subscription data and remaining time
    return 'free' // Simplified for now
  }

  /**
   * Creates or updates subscription in DynamoDB
   */
  async updateSubscription(
    userId: string,
    subscriptionData: {
      subscriptionId?: string
      planName: string
      nextPaymentDate?: string
      lastFourDigits?: number
    }
  ): Promise<void> {
    try {
      console.log(`📝 Updating subscription for user: ${userId}`)

      if (!subscriptionData.subscriptionId) {
        throw new Error('subscriptionId is required')
      }

      // Check if subscription already exists
      const existingSubscription = await this.getExistingSubscription(userId)

      const subscriptionPayload = {
        id: userId,
        userId: userId,
        subscriptionId: subscriptionData.subscriptionId,
        planName: subscriptionData.planName,
        nextPaymentDate: subscriptionData.nextPaymentDate,
        lastFourDigits: subscriptionData.lastFourDigits,
        pendingPlan: null, // Clear pending plan on successful payment
      }

      if (existingSubscription) {
        // Update existing record
        console.log(`🔄 Updating existing subscription record`)
        await dynamoClient.models.UserSubscription.update(subscriptionPayload)
      } else {
        // Create new record
        console.log(`✨ Creating new subscription record`)
        await dynamoClient.models.UserSubscription.create(subscriptionPayload)
      }

      console.log(`✅ Subscription saved successfully`)
    } catch (error) {
      console.error(`❌ Error saving subscription for ${userId}:`, error)
      console.error('Subscription data:', JSON.stringify(subscriptionData, null, 2))
      throw new Error(`Failed to save subscription: ${userId}`)
    }
  }
}
