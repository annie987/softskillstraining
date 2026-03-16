import { render, screen } from '@testing-library/react';
import App from './App';

test('renders interview practice app', () => {
  render(<App />);
  const title = screen.getByText(/Consultant Interview Practice/i);
  expect(title).toBeInTheDocument();
});
