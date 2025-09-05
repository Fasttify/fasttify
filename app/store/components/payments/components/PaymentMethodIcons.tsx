import Image from 'next/image';
import { LegacyStack } from '@shopify/polaris';

interface PaymentMethodIconProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

const PaymentMethodIcon = ({ src, alt, width = 40, height = 25 }: PaymentMethodIconProps) => (
  <Image src={src} alt={alt} width={width} height={height} className="object-contain" />
);

export const WompiPaymentIcons = () => (
  <LegacyStack spacing="tight" wrap>
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/visa.svg" alt="Visa" />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/masterdcard.svg" alt="Mastercard" width={45} />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/amexp.svg" alt="american express" width={45} />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/daviplata.svg" alt="daviplata" />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/nequi.png" alt="Nequi" width={35} />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/pse.png" alt="PSE" width={35} />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/bancolombia.svg" alt="Bancolombia" width={45} />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/qr.svg" alt="qr" />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/efectivo.svg" alt="efectivo" width={45} />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/paga-despues.svg" alt="paga después" />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/su-pay.svg" alt="su pay" width={45} />
  </LegacyStack>
);

export const MercadoPagoIcons = () => (
  <LegacyStack spacing="tight" wrap>
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/visa.svg" alt="Visa" />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/masterdcard.svg" alt="Mastercard" width={45} />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/amexp.svg" alt="american express" width={45} />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/nequi.png" alt="Nequi" width={35} />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/pse.png" alt="PSE" width={35} />
    <PaymentMethodIcon src="https://cdn.fasttify.com/assets/b/mercadopago-logo.webp" alt="mercado pago" width={45} />
  </LegacyStack>
);
