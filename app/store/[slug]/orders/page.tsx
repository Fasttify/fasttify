import { Orders } from '@/app/store/components/orders/components/Orders'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export default function OrdersPage() {
  return <Orders />
}
