import type { Metadata } from 'next';

import { ProfileSetupForm } from '@/components/auth/ProfileSetupForm';

export const metadata: Metadata = {
  title: '프로필 설정 | Ridy',
};

export default function ProfileSetupPage() {
  return <ProfileSetupForm />;
}
