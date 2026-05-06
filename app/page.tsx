'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '../lib/api';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
    } else {
      router.push(`/${user.role}`);
    }
  }, [router]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" />
    </div>
  );
}
