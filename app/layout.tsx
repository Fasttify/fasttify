import type { Metadata } from 'next'
import { ReactQueryProvider } from '@/utils/ReactQueryProvider'
import ConfigureAmplifyClientSide from '@/utils/ConfigureAmplify'
import { Amplify } from 'aws-amplify'
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

export const metadata: Metadata = {
  metadataBase: new URL('https://www.fasttify.com'),
  title: {
    template: '%s',
    default: 'Fasttify',
  },
  description: 'Crea tu tienda online en minutos con Fasttify',
  keywords: ['ecommerce', 'dropshipping', 'tienda online', 'Fasttify', 'compras online'],
  openGraph: {
    title: 'Fasttify',
    description: 'Fasttify potencia tu tienda online de dropshipping.',
    url: 'https://www.fasttify.com',
    siteName: 'Fasttify',
    images: [
      {
        url: 'https://www.fasttify.com/icons/fast@4x.webp',
        width: 800,
        height: 600,
        alt: 'Fasttify ',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fasttify - Ecommerce Dropshipping',
    description: 'Fasttify potencia tu tienda online de dropshipping.',
    images: ['https://www.fasttify.com/icons/fast@4x.webp'],
  },
  icons: {
    icon: '/icons/fast@4x.webp',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <ConfigureAmplifyClientSide />
      {children}
    </ReactQueryProvider>
  )
}
