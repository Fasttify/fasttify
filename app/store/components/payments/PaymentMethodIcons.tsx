import Image from 'next/image'

interface PaymentMethodIconProps {
  src: string
  alt: string
  width?: number
  height?: number
}

const PaymentMethodIcon = ({ src, alt, width = 40, height = 25 }: PaymentMethodIconProps) => (
  <Image src={src} alt={alt} width={width} height={height} className="object-contain" />
)

export const WompiPaymentIcons = () => (
  <div className="flex flex-wrap gap-2 mt-1">
    <PaymentMethodIcon src="/svgs/visa.svg" alt="Visa" />
    <PaymentMethodIcon src="/svgs/masterdcard.svg" alt="Mastercard" width={45} />
    <PaymentMethodIcon src="/svgs/amexp.svg" alt="american express" width={45} />
    <PaymentMethodIcon src="/svgs/daviplata.svg" alt="daviplata" />
    <PaymentMethodIcon src="/icons/nequi.png" alt="Nequi" width={35} />
    <PaymentMethodIcon src="/icons/pse.png" alt="PSE" width={35} />
    <PaymentMethodIcon src="/svgs/bancolombia.svg" alt="Bancolombia" width={45} />
    <PaymentMethodIcon src="/svgs/qr.svg" alt="qr" />
    <PaymentMethodIcon src="/svgs/efectivo.svg" alt="efectivo" width={45} />
    <PaymentMethodIcon src="/svgs/paga-despues.svg" alt="paga después" />
    <PaymentMethodIcon src="/svgs/su-pay.svg" alt="su pay" width={45} />
  </div>
)

export const MercadoPagoIcons = () => (
  <div className="flex flex-wrap gap-2 mt-1">
    <PaymentMethodIcon src="/svgs/visa.svg" alt="Visa" />
    <PaymentMethodIcon src="/svgs/masterdcard.svg" alt="Mastercard" width={45} />
    <PaymentMethodIcon src="/svgs/amexp.svg" alt="american express" width={45} />
    <PaymentMethodIcon src="/icons/nequi.png" alt="Nequi" width={35} />
    <PaymentMethodIcon src="/icons/pse.png" alt="PSE" width={35} />
    <PaymentMethodIcon src="/icons/mercadopago-logo.webp" alt="mercado pago" width={45} />
  </div>
)
