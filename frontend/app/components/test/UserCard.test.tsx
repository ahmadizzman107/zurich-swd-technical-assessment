import { PublicUser } from '@/app/store/usersApi';
import { render, screen, waitFor } from '@testing-library/react';
import UserCard from '../UserCard';
import { userEvent } from '@testing-library/user-event';
import { getSession } from 'next-auth/react';

const mockUser: PublicUser = {
  id: 1,
  firstName: 'George',
  lastName: 'Lopez',
  maskedEmail: 'ge***@x.com',
  avatar: '',
};

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));

const mockedGetSession = getSession as jest.Mock;

describe('UserCard', () => {
  beforeEach(() => {
    mockedGetSession.mockResolvedValue({ accessToken: 'fake-token' });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        email: 'george@mail.com',
      }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should show masked email by default', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('ge***@x.com')).toBeInTheDocument();
    expect(screen.queryByText('george@mail.com')).not.toBeInTheDocument();
  });

  it('should fetch and reveal the real email when clicked. Also sends bearer token', async () => {
    const event = userEvent.setup();

    render(<UserCard user={mockUser} />);

    await event.click(screen.getByRole('button', { name: /reveal/i }));

    await waitFor(() => {
      expect(screen.getByText('george@mail.com')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/1/email'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer fake-token',
        },
      }),
    );
  });

  it('should not crash and show nothing when there is no session', async () => {
    mockedGetSession.mockResolvedValue(null);
    const event = userEvent.setup();

    render(<UserCard user={mockUser} />);

    await event.click(screen.getByRole('button', { name: /reveal/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('users/1/email'), expect.objectContaining({ headers: {} }));
    });
  });

  it('should not reveal email when request fails by unauthorized', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 }) as jest.Mock;

    const event = userEvent.setup();
    render(<UserCard user={mockUser} />);

    await event.click(screen.getByRole('button', { name: /reveal/i }));

    expect(screen.getByText('ge***@x.com')).toBeInTheDocument();
    expect(screen.queryByText('george@mail.com')).not.toBeInTheDocument();
  });
  it('should toggles back to masked email when re-clicked, no re-fetch', async () => {
    const event = userEvent.setup();

    render(<UserCard user={mockUser} />);

    const revealRealEmail = async () => {
      await event.click(screen.getByRole('button', { name: /reveal/i }));
      await waitFor(() => {
        screen.getByText('george@mail.com');
      });
    };

    await revealRealEmail();

    await event.click(screen.getByRole('button', { name: /hide/i }));
    await waitFor(() => {
      expect(screen.getByText('ge***@x.com')).toBeInTheDocument();
    });

    await revealRealEmail();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
