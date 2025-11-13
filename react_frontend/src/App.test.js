import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header brand', () => {
  render(<App />);
  expect(screen.getByLabelText(/News Explorer Home/i)).toBeInTheDocument();
});
