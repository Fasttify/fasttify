import outputs from '@/amplify_outputs.json';
import { Amplify } from 'aws-amplify';

Amplify.configure(outputs);
const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
});
export const metadata = {
  title: 'Creando tu tienda',
};

export default function FirstStepsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
