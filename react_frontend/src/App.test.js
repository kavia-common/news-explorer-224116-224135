import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header brand', () => {
  render(<App />);
  expect(screen.getByLabelText(/News Explorer Home/i)).toBeInTheDocument();
});

test('renders search control with button', () => {
  render(<App />);
  // Ensure the main search region and visible Search button are present (date filters no longer exist)
  expect(screen.getByRole('search')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
});
