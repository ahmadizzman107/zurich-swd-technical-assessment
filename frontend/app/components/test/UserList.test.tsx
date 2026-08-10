import { useGetUsersQuery } from '@/app/store/usersApi';
import { render, screen } from '@testing-library/react';
import UserList from '../UserList';

jest.mock('@/app/store/usersApi', () => ({
  useGetUsersQuery: jest.fn(),
}));

const mockedUseGetUsersQuery = useGetUsersQuery as jest.Mock;

describe('UserList', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should show the loading state', () => {
    mockedUseGetUsersQuery.mockReturnValue({
      isLoading: true,
      isError: false,
    });

    render(<UserList />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should show nothing when no users found', () => {
    mockedUseGetUsersQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: [], page: 1, limit: 6, total: 0, totalPages: 1 },
    });

    render(<UserList />);

    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it('should render a list of users and pagination control', () => {
    mockedUseGetUsersQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: [{ id: 1, firstName: 'George', lastName: 'Lopez', maskedEmail: 'ge***@x.com', avatar: '' }], page: 1, limit: 6, total: 1, totalPages: 2 },
    });

    render(<UserList />);

    expect(screen.getByText('George Lopez')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
  });

  it('should disable Next button when on last page', () => {
    mockedUseGetUsersQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: [], page: 2, limit: 6, total: 1, totalPages: 2 },
    });

    render(<UserList />);

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });
});
