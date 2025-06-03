import { PaymentSettings } from '@/app/store/components/payments/components/PaymentSettings'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export default function PaymentsPage() {
  return <PaymentSettings />
}
