import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Dashboard from '../dashboard';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

jest.mock('axios');

describe('Dashboard Component', () => {
  it('renders presentations and navigates to edit', () => {
    const presentations = {
      1: { title: 'Presentation 1', slides: 3, description: 'Test presentation' },
      2: { title: 'Presentation 2', slides: 2, description: '' },
    };

    // Mock Axios GET request
    axios.get.mockResolvedValue({ data: { store: { presentations } } });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Ensure the mocked presentations render
    axios.get().then(() => {
      const presentation1 = screen.getByText(/presentation 1/i);
      expect(presentation1).toBeInTheDocument();

      // Simulate navigation to the edit page
      userEvent.click(presentation1);
      const editText = screen.queryByText(/edit/i); // Adjust this based on what the edit page shows
      expect(editText).toBeTruthy();
    });
  });
});
