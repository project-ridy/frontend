'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { NearbyHomeSurface } from '@/components/ridy/NearbyHomeSurface';

export default function Home() {
  return (
    <AuthGuard>
      <NearbyHomeSurface />
    </AuthGuard>
  );
}
