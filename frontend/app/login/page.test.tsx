import { render, screen } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import LoginPage from './page';
import { userEvent } from '@testing-library/user-event';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('LoginPage', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render a sign-in button', () => {
    render(<LoginPage />);

    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('should call signIn and redirect to user list page on success', async () => {
    const event = userEvent.setup();

    render(<LoginPage />);
    await event.click(screen.getByRole('button', { name: /sign in with google/i }));

    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/users' });
  });
});
