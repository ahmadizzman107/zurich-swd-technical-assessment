'use client';

import { signOut } from 'next-auth/react';
import React from 'react';

type Props = {};

function LogoutButton({}: Props) {
  return (
    <button onClick={() => signOut({ callbackUrl: '/login' })} className='rounded bg-red-600 px-4 py-2 text-white'>
      Logout
    </button>
  );
}

export default LogoutButton;
