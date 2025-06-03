import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'

export const configureAmplify = () => {
  Amplify.configure(outputs)
  const existingConfig = Amplify.getConfig()
  Amplify.configure({
    ...existingConfig,
    API: {
      ...existingConfig.API,
      REST: outputs.custom.APIs,
    },
  })
}
