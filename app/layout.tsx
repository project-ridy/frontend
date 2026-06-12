import type { Metadata } from 'next';
import localFont from 'next/font/local';

import './globals.css';
import { Providers } from '@/app/providers';
import { cn } from '@/lib/utils';

const pretendard = localFont({
  src: [
    { path: '../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../node_modules/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-pretendard',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ridy - 함께 타는 길',
  description: '안전하고 편리한 친환경 카풀 연결 서비스 Ridy',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko" className={cn('font-sans', pretendard.variable)}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
