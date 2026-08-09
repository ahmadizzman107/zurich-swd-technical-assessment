import React from 'react';

function UnauthorizedPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
      <h1 className='text-xl font-semibold'>Access Denied</h1>
      <p className='text-gray-500'>You need to sign in to view this page.</p>
      <a href='/login' className='rounded bg-blue-600 px-4 py-2 text-white'>
        Go to Login
      </a>
    </div>
  );
}

export default UnauthorizedPage;
