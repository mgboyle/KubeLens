import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders HelmScope header', () => {
  render(<App />);
  const headerElement = screen.getByText(/HelmScope/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders manifest input section', () => {
  render(<App />);
  const inputHeader = screen.getByText(/Helm Manifest Input/i);
  expect(inputHeader).toBeInTheDocument();
});
