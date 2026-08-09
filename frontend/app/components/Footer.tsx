import React from 'react';

type FooterProps = { text?: string };

function Footer({ text = `© ${new Date().getFullYear()} Zurich Portal` }: FooterProps) {
  return <footer className='border-t p-4 text-sm text-gray-500'>{text}</footer>;
}
export default Footer;
