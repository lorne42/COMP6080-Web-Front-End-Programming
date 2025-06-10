import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Welcome from '../welcome';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

describe('Welcome Component', () => {
  it('renders buttons and navigates correctly', () => {
    const history = createMemoryHistory();
    render(
      <Router location={history.location} navigator={history}>
        <Welcome />
      </Router>
    );

    // Check if both buttons are present
    expect(screen.getByText(/register/i)).toBeInTheDocument();
    expect(screen.getByText(/login/i)).toBeInTheDocument();

    // Simulate navigation to Register page
    fireEvent.click(screen.getByText(/register/i));
    expect(history.location.pathname).toBe('/register');

    // Simulate navigation to Login page
    fireEvent.click(screen.getByText(/login/i));
    expect(history.location.pathname).toBe('/login');
  });
});
