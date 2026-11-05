import { screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.mock('../src/App', () => ({ default: () => <p>app</p> }));
vi.mock('../src/styles.css', () => ({}));

it('mounts App into #root', async () => {
  document.body.innerHTML = '<div id="root"></div>';
  await import('../src/index.jsx');
  await waitFor(() => expect(screen.getByText('app')).toBeTruthy());
});
