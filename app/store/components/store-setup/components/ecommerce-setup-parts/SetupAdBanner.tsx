import { Banner } from '@shopify/polaris'
import { useState } from 'react'

interface SetupAdBannerProps {
  onActionClick: () => void
}

export function SetupAdBanner({ onActionClick }: SetupAdBannerProps) {
  const [visible, setVisible] = useState(true)

  if (!visible) {
    return null
  }

  return (
    <Banner
      title="Suscríbete a un plan y obtén 3 meses a solo $1 al mes en Fasttify"
      tone="info"
      onDismiss={() => setVisible(false)}
      action={{ content: 'Ver planes', onAction: onActionClick }}
    />
  )
}
