import { render, screen } from '@testing-library/react';
import App from './App';

test('renders school attendance system heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/School Attendance System/i);
  expect(headingElement).toBeInTheDocument();
});