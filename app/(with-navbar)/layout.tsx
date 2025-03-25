import { Navbar } from '@/app/(with-navbar)/landing/components/NavBar'
import outputs from '@/amplify_outputs.json'
import { Amplify } from 'aws-amplify'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

export default function WithNavbarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
