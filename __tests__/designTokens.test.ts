import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('디자인 토큰', () => {
  it('Socar Frame 참고 기반 Ridy palette token을 노출한다', () => {
    const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

    for (const token of [
      '--color-white: #ffffff',
      '--color-black: #000000',
      '--color-gray-200: #e5e7eb',
      '--color-gray-300: #d1d5db',
      '--color-gray-700: #374151',
      '--color-gray-1000: #141a24',
      '--color-blue-50: #ebf5ff',
      '--color-blue-100: #d6eafe',
      '--color-blue-600: #2563eb',
      '--color-blue-900: #0033a9',
      '--color-green-50: #e6fef0',
      '--color-green-700: #047857',
      '--color-green-900: #008d7a',
      '--color-red-50: #fff0f3',
      '--color-red-700: #b91c1c',
      '--color-red-900: #c10027',
      '--color-orange-50: #fff7ed',
      '--color-orange-700: #b45309',
    ]) {
      expect(css.toLowerCase()).toContain(token);
    }
  });

  it('semantic/radius/elevation token을 Tailwind theme에 노출한다', () => {
    const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

    for (const token of [
      '--color-primary-hover: var(--color-primary-hover)',
      '--color-primary-pressed: var(--color-primary-pressed)',
      '--color-primary-subtle: var(--color-primary-subtle)',
      '--color-surface: var(--color-surface)',
      '--color-surface-muted: var(--color-surface-muted)',
      '--color-surface-raised: var(--color-surface-raised)',
      '--color-border-default: var(--color-border-default)',
      '--color-border-input: var(--color-border-input)',
      '--color-text-primary: var(--color-text-primary)',
      '--color-text-secondary: var(--color-text-secondary)',
      '--color-text-inverse: var(--color-text-inverse)',
      '--shadow-card: var(--shadow-card)',
      '--shadow-raised: var(--shadow-raised)',
      '--radius-ridy-sm: var(--radius-ridy-sm)',
      '--radius-ridy-md: var(--radius-ridy-md)',
      '--radius-ridy-lg: var(--radius-ridy-lg)',
      '--radius-ridy-xl: var(--radius-ridy-xl)',
      '--radius-ridy-2xl: var(--radius-ridy-2xl)',
    ]) {
      expect(css).toContain(token);
    }
  });

  it('dark token과 Ridy semantic token이 충돌하지 않는다', () => {
    const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

    expect(css).toContain('.dark {');
    expect(css).toContain('--background:');
    expect(css).toContain('--foreground:');
    expect(css).toContain('--color-primary: #2563eb');
    expect(css).toContain('--color-surface-muted: var(--color-gray-50)');
  });

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

  it('간격, 반경, 입력 높이 토큰을 Tailwind theme에 연결한다', () => {
    const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

    for (const token of [
      '--spacing-page-mobile: 1rem',
      '--spacing-page-tablet: 1.5rem',
      '--spacing-page-desktop: 2rem',
      '--spacing-gap-tight: 0.75rem',
      '--spacing-gap-normal: 1rem',
      '--spacing-gap-loose: 1.5rem',
      '--radius-button: var(--radius-button)',
      '--radius-card: var(--radius-card)',
      '--height-input: 3rem',
    ]) {
      expect(css).toContain(token);
    }
  });
});
