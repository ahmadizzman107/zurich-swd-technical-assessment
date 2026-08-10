import React from 'react';
import LogoutButton from './LogoutButton';

type HeaderProps = { title: string };

function Header({ title }: HeaderProps) {
  return (
    <header className='flex items-center justify-between border-b p-4'>
      <h1 className='text-lg font-semibold'>{title}</h1>
      <LogoutButton />
    </header>
  );
}

export default Header;
