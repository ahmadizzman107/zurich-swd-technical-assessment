'use client';

import { useState } from 'react';
import { useGetUsersQuery } from '../store/usersApi';
import UserCard from './UserCard';

function UserList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useGetUsersQuery({ page, limit: 6 });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Failed to load users. {error.toString()}</div>;
  }
  if (!data || data.data.length === 0) {
    return <div>No users found.</div>;
  }
  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        {data.data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
      <div className='flex items-center gap-2'>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>
          Page {data.page} of {data.totalPages}
        </span>
        <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

export default UserList;
