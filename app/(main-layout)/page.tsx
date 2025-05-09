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

export default function Home() {
  useEffect(() => {
    const hubListenerCancelToken = Hub.listen('auth', async ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          const user = await getCurrentUser()
          const userAttributes = await fetchUserAttributes()
          console.log({ user, userAttributes })
          break
        case 'signInWithRedirect_failure':
          console.log('error during sign in', Error)
          break
        case 'customOAuthState':
          const state = payload.data // this will be customState provided on signInWithRedirect function
          console.log(state)
          break
      }
    })

    return () => hubListenerCancelToken()
  }, [])

  return <DocsLanding />
}
