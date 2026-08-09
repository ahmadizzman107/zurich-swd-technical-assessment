'use client';

import { signIn } from 'next-auth/react';

function LoginPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
      <h1 className='text-xl font-semibold'>Zurich Customer Portal</h1>
      <button onClick={() => signIn('google', { callbackUrl: '/users' })} className='rounded bg-blue-600 px-4 py-2 text-white'>
        Sign in with Google
      </button>
    </div>
  );
}

export default LoginPage;
