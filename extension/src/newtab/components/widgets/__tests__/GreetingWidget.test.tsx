import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GreetingWidget from '../GreetingWidget';
import { storage } from '../../../../shared/utils/storage';
import { getGreetingByHour } from '../../../utils/greetingUtils';

// Mock storage
jest.mock('../../../../shared/utils/storage', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

// Mock the greeting utility to control the greeting
jest.mock('../../../utils/greetingUtils', () => ({
  getGreetingByHour: jest.fn(),
}));

const mockStorage = storage as jest.Mocked<typeof storage>;
const mockGetGreetingByHour = getGreetingByHour as jest.MockedFunction<typeof getGreetingByHour>;

describe('GreetingWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.get.mockResolvedValue(null);
    mockStorage.set.mockResolvedValue(undefined);
    mockGetGreetingByHour.mockReturnValue('Good morning');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial Rendering', () => {
    it('renders with default greeting and "friend" when no name is saved', async () => {
      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText(/Good morning/)).toBeInTheDocument();
        expect(screen.getByText('friend')).toBeInTheDocument();
      });
    });

    it('displays saved name from storage', async () => {
      mockStorage.get.mockResolvedValue('John');

      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
      });
    });

    it('loads name from storage on mount', async () => {
      render(<GreetingWidget />);

      await waitFor(() => {
        expect(mockStorage.get).toHaveBeenCalledWith('greeting_user_name');
      });
    });
  });

  describe('Time-based Greeting', () => {
    it('displays morning greeting', async () => {
      mockGetGreetingByHour.mockReturnValue('Good morning');

      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText(/Good morning/)).toBeInTheDocument();
      });
    });

    it('displays afternoon greeting', async () => {
      mockGetGreetingByHour.mockReturnValue('Good afternoon');

      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText(/Good afternoon/)).toBeInTheDocument();
      });
    });

    it('displays evening greeting', async () => {
      mockGetGreetingByHour.mockReturnValue('Good evening');

      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText(/Good evening/)).toBeInTheDocument();
      });
    });

    it('displays night greeting', async () => {
      mockGetGreetingByHour.mockReturnValue('Good night');

      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText(/Good night/)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode', () => {
    it('enters edit mode on name click', async () => {
      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText('friend')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('friend'));

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('shows input with current name value when editing', async () => {
      mockStorage.get.mockResolvedValue('Alice');

      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Alice'));

      expect(screen.getByRole('textbox')).toHaveValue('Alice');
    });

    it('saves name on Enter key and exits edit mode', async () => {
      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText('friend')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('friend'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Bob' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(mockStorage.set).toHaveBeenCalledWith('greeting_user_name', 'Bob');
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
      });
    });

    it('cancels edit on Escape key and reverts to original name', async () => {
      mockStorage.get.mockResolvedValue('Original');

      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText('Original')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Original'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Changed' } });
      fireEvent.keyDown(input, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.getByText('Original')).toBeInTheDocument();
        expect(mockStorage.set).not.toHaveBeenCalled();
      });
    });

    it('saves name on blur', async () => {
      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText('friend')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('friend'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Charlie' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(mockStorage.set).toHaveBeenCalledWith('greeting_user_name', 'Charlie');
      });
    });

    it('trims whitespace from name when saving', async () => {
      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText('friend')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('friend'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '  David  ' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(mockStorage.set).toHaveBeenCalledWith('greeting_user_name', 'David');
      });
    });

    it('reverts to "friend" when saving empty name', async () => {
      mockStorage.get.mockResolvedValue('OldName');

      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText('OldName')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('OldName'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(mockStorage.set).toHaveBeenCalledWith('greeting_user_name', '');
        expect(screen.getByText('friend')).toBeInTheDocument();
      });
    });
  });

  describe('Input Accessibility', () => {
    it('input has placeholder text', async () => {
      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText('friend')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('friend'));

      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('input has autofocus when entering edit mode', async () => {
      render(<GreetingWidget />);

      await waitFor(() => {
        expect(screen.getByText('friend')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('friend'));

      expect(screen.getByRole('textbox')).toHaveFocus();
    });
  });
});
