import { InProgress } from '@/app/store/components/orders/components/InProgress'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export default function ProcessingPage() {
  return <InProgress />
}
