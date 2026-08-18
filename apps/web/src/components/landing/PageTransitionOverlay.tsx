'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export function usePageTransition() {
  const router = useRouter();

  const navigateWithTransition = (href: string) => {
    router.push(href);
  };

  return { navigateWithTransition };
}

export const PageTransitionOverlay: React.FC = () => {
  return null;
};
