import { renderHook, waitFor } from '@testing-library/react';
import { useIsClient } from '@/hooks/ui/useIsClient';

describe('useIsClient', () => {
  it('starts with the server snapshot and becomes true after hydration', async () => {
    const { result } = renderHook(() => useIsClient());

    expect(result.current).toBe(false);
    await waitFor(() => expect(result.current).toBe(true));
  });
});
