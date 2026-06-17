import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const globalsCss = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

describe('FE-KT-001 KT 디자인 토큰', () => {
  it('KT semantic token이 CSS theme 변수로 노출된다', () => {
    const requiredTokens = [
      '--color-gray-150: #eef0f3',
      '--color-gray-450: #8b939f',
      '--color-gray-550: #5e6673',
      '--color-red-600: #dc2626',
      '--color-danger-on-muted: var(--color-red-600)',
      '--color-surface-secondary: var(--color-gray-100)',
      '--color-text-tertiary-on-muted: var(--color-gray-550)',
      '--radius-pill: 9999px',
      '--shadow-1:',
      '--motion-duration-fast:',
      '--motion-duration-normal:',
    ];

    for (const token of requiredTokens) {
      expect(globalsCss.toLowerCase()).toContain(token);
    }
  });

  it('Tailwind theme에 KT semantic token과 reduced-motion guard가 연결된다', () => {
    const requiredThemeBindings = [
      '--color-danger-on-muted: var(--color-danger-on-muted)',
      '--color-surface-secondary: var(--color-surface-secondary)',
      '--color-text-tertiary-on-muted: var(--color-text-tertiary-on-muted)',
      '--radius-pill: var(--radius-pill)',
      '--shadow-1: var(--shadow-1)',
      '--duration-fast: var(--motion-duration-fast)',
      '--duration-normal: var(--motion-duration-normal)',
    ];

    for (const binding of requiredThemeBindings) {
      expect(globalsCss.toLowerCase()).toContain(binding);
    }

    expect(globalsCss).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('KT palette가 문서화된 색상 단계만 노출한다', () => {
    const undocumentedTokens = [
      '--color-blue-900:',
      '--color-green-50:',
      '--color-green-500:',
      '--color-green-700:',
      '--color-green-900:',
      '--color-red-900:',
    ];

    for (const token of undocumentedTokens) {
      expect(globalsCss.toLowerCase()).not.toContain(token);
    }
  });
});
