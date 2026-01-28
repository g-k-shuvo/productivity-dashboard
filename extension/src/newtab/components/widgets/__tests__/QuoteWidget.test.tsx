import { render, screen } from '@testing-library/react';
import QuoteWidget from '../QuoteWidget';

// Mock the API service
jest.mock('../../../../shared/services/api', () => ({
  apiService: {
    get: jest.fn(),
  },
}));

describe('QuoteWidget', () => {
  it('renders loading state initially', () => {
    render(<QuoteWidget />);
    expect(screen.getByText(/loading quote/i)).toBeInTheDocument();
  });

  // Add more tests as needed
});

