'use client';

import { Amplify } from 'aws-amplify';
import DocsLanding from '@/app/(main-layout)/landing/components/DocsLanding';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs);

const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
});

export default function Home() {
  return <DocsLanding />;
}
