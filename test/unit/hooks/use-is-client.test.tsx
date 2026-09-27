import { render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { useIsClient } from '@/hooks/ui/useIsClient';

describe('useIsClient', () => {
  it('starts with the server snapshot and becomes true after hydration', async () => {
    function ClientStatus() {
      return <span>{String(useIsClient())}</span>;
    }

    expect(renderToString(<ClientStatus />)).toBe('<span>false</span>');

    render(<ClientStatus />);
    await waitFor(() => expect(screen.getByText('true')).toBeInTheDocument());
  });
});
