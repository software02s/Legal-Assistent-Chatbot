// src/Chatbot.test.jsx
import React from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import Chatbot from './Chatbot';

// Mock scrollIntoView për të shmangur error-in
window.HTMLElement.prototype.scrollIntoView = () => {};

beforeAll(() => {
  jest.useFakeTimers();  // Aktivizo fake timers nëse përdor timer në Chatbot.jsx
});

afterEach(() => {
  cleanup();
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('renders Chatbot without crashing', async () => {
  render(<Chatbot />);
  await waitFor(() => {
    expect(screen.getByText(/Chatbot AI/i)).toBeInTheDocument();
  });
});
