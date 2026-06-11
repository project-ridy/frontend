import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Ridy - 함께 타는 길',
  description: '안전하고 편리한 친환경 카풀 연결 서비스 Ridy',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
