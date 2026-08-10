'use client';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

import React, { useState } from 'react';
import { PublicUser } from '../store/usersApi';
import { getSession } from 'next-auth/react';

function UserCard({ user }: { user: PublicUser }) {
  const [revealed, setRevealed] = useState(false);
  const [realEmail, setRealEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReveal = async () => {
    if (revealed) {
      setRevealed(false);
      return;
    }
    if (!realEmail) {
      setLoading(true);
      const session = await getSession();
      const res = await fetch(`${API_URL}/users/${user.id}/email`, {
        headers: session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {},
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }
      const { email } = await res.json();

      setRealEmail(email);
      setLoading(false);
    }
    setRevealed(true);
  };

  return (
    <div className='flex items-center gap-3 border rounded p-3'>
      <img src={user.avatar} alt='' className='h-10 w-10 rounded-full' />
      <div>
        <p className='font-medium'>
          {user.firstName} {user.lastName}
        </p>
        <p className='text-sm text-gray-500'>{revealed && realEmail ? realEmail : user.maskedEmail}</p>
      </div>
      <button onClick={handleReveal} className='ml-auto text-sm underline'>
        {loading ? '...' : revealed ? 'Hide' : 'Reveal'}
      </button>
    </div>
  );
}

export default UserCard;
