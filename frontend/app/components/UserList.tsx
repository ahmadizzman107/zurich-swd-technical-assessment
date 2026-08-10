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
  if (!data) {
    return <div>No users found.</div>;
  }

  const isEmpty = data.data.length === 0;
  const isFirstPage = data.page <= 1;
  const isLastPage = data.page >= data.totalPages;

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>{!isEmpty ? data.data.map((user) => <UserCard key={user.id} user={user} />) : <div>No users found.</div>}</div>
      <div className='flex items-center gap-2'>
        <button disabled={isFirstPage} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>
          Page {data.page} of {data.totalPages}
        </span>
        <button disabled={isLastPage} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

export default UserList;
