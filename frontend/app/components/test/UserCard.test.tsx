import { PublicUser } from '@/app/store/usersApi';
import { render, screen, waitFor } from '@testing-library/react';
import UserCard from '../UserCard';
import { userEvent } from '@testing-library/user-event';

const mockUser: PublicUser = {
  id: 1,
  firstName: 'George',
  lastName: 'Lopez',
  maskedEmail: 'ge***@x.com',
  avatar: '',
};

describe('UserCard', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        email: 'george@mail.com',
      }),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should show masked email by default', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('ge***@x.com')).toBeInTheDocument();
    expect(screen.queryByText('george@mail.com')).not.toBeInTheDocument();
  });

  it('should fetch and reveal the real email when clicked', async () => {
    const event = userEvent.setup();

    render(<UserCard user={mockUser} />);

    await event.click(screen.getByRole('button', { name: /reveal/i }));

    await waitFor(() => {
      expect(screen.getByText('george@mail.com')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/users/1/email'));
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
