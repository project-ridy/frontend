import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('디자인 토큰', () => {
  it('브랜드 컬러와 Pretendard 폰트 토큰을 globals.css에 정의한다', () => {
    const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

    for (const token of [
      '--color-primary: #2563eb',
      '--color-primary-light: #3b82f6',
      '--color-primary-dark: #1d4ed8',
      '--color-secondary: #10b981',
      '--color-warning: #f59e0b',
      '--color-danger: #ef4444',
      '--color-gray-50: #f9fafb',
      '--color-gray-100: #f3f4f6',
      '--color-gray-500: #6b7280',
      '--color-gray-900: #111827',
      '--font-pretendard:',
    ]) {
      expect(css.toLowerCase()).toContain(token);
    }
  });

  it('shadcn/ui CSS 변수가 정의되어 있다', () => {
    const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

    for (const token of ['--background:', '--foreground:', '--primary:', '--card:', '--border:', '--ring:']) {
      expect(css).toContain(token);
    }
  });

  it('Pretendard 폰트가 --font-sans에 연결되어 있다', () => {
    const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');
    expect(css).toContain('--font-sans: var(--font-pretendard)');
  });
});
