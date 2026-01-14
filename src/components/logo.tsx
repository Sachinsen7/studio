'use client';

import React from 'react';

export default function Logo({ className }: { className?: string }) {
  return (
    <>
      <img src="/images/logo1.png" alt="ADRS logo" className={`dark:hidden ${className ?? ''}`} />
      <img src="/images/logo2.png" alt="ADRS logo" className={`hidden dark:inline ${className ?? ''}`} />
    </>
  );
}
