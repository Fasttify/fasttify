'use client';

import { Loading } from '@shopify/polaris';

export function ProductFormLoading() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
      }}>
      <Loading />
    </div>
  );
}
