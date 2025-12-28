'use client';

import { useEffect } from 'react';

export default function ConsoleGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.log = () => undefined;
    }
  }, []);

  return null;
}
