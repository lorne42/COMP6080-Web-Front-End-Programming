import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Register from '../register';
import { MemoryRouter } from 'react-router-dom';

describe('Register Component', () => {
  it('renders the form and validates password mismatch', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Check if all form fields are present
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    // Enter mismatching passwords
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password2' } });
    fireEvent.click(screen.getByText(/register/i));

    // Expect error message
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });
});
