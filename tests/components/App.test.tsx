import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../../src/App';

vi.mock('../../src/components/Main', () => ({
  default: ({ files }: { files: { title: string }[] }) => (
    <div>{files.map(f => f.title).join(',')}</div>
  )
}));

describe('App', () => {
  it('fetches sounds.json and passes it to Main', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ json: async () => [{ title: 'Bob' }, { title: 'Ann' }] }))
    );
    render(<App />);
    await waitFor(() => expect(screen.getByText('Bob,Ann')).toBeTruthy());
    expect(fetch).toHaveBeenCalledWith('/sounds.json');
  });
});
