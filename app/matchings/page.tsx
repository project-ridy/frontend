'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { NearbyHomeSurface } from '@/components/ridy/NearbyHomeSurface';

export default function MatchingsPage() {
  return (
    <AuthGuard>
      <NearbyHomeSurface />
    </AuthGuard>
  );
}
