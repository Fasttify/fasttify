'use client'

import { useEffect } from 'react'
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth'
import { ConsoleLogger, Hub } from 'aws-amplify/utils'
import { Amplify } from 'aws-amplify'
import 'aws-amplify/auth/enable-oauth-listener'
import DocsLanding from '@/app/(main-layout)/landing/components/DocsLanding'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

const logger = new ConsoleLogger('HomePage')

export default function Home() {
  useEffect(() => {
    const hubListenerCancelToken = Hub.listen('auth', async ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          try {
            const user = await getCurrentUser()
            const userAttributes = await fetchUserAttributes()
            logger.log({ user, userAttributes })
          } catch (error) {
            logger.error('Error getting user session:', error)
          }
          break
        case 'signInWithRedirect_failure':
          logger.error('Login failed with redirect:', payload.data)
          break
        case 'customOAuthState':
          const state = payload.data
          logger.log('Custom status:', state)
          break
      }
    })

    return () => hubListenerCancelToken()
  }, [])

  return <DocsLanding />
}
