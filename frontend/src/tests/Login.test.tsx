import { render, screen, fireEvent } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/Login';

// Mock useAuth Hook
jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('Login Component', () => {
  it('renders login form and handles successful login', async () => {
    const mockLogin = jest.fn().mockResolvedValueOnce(undefined);
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      loginWithGoogle: jest.fn(),
    });

    render(<Login />);

    // Simulate user input
    const emailInput = screen.getByPlaceholderText('E-Mail');
    const passwordInput = screen.getByPlaceholderText('Passwort');
    const submitButton = screen.getByText('Login');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Assert login function was called
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('shows an error message on failed login', async () => {
    const mockLogin = jest.fn().mockRejectedValueOnce(new Error('Login failed'));
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      loginWithGoogle: jest.fn(),
    });

    render(<Login />);

    // Simulate user input
    const emailInput = screen.getByPlaceholderText('E-Mail');
    const passwordInput = screen.getByPlaceholderText('Passwort');
    const submitButton = screen.getByText('Login');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    // Wait for the error message
    const errorMessage = await screen.findByText('Fehler bei der Anmeldung.');
    expect(errorMessage).toBeInTheDocument();
  });
});
