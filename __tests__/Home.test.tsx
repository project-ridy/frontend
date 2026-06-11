import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Home from '@/app/page';

describe('홈 온보딩 화면', () => {
  it('브랜드 슬로건과 소셜 로그인 진입점을 보여준다', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /Ridy/i })).toBeInTheDocument();
    expect(screen.getByText('함께 타는 길')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '카카오 로그인' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '구글 로그인' })).toBeInTheDocument();
    expect(screen.getByText('회원가입 없이 소셜 계정으로 바로 시작')).toBeInTheDocument();
  });

  it('안전, 편리, 친환경, 연결 키워드를 강조한다', () => {
    render(<Home />);

    for (const keyword of ['안전', '편리', '친환경', '연결']) {
      expect(screen.getByText(keyword)).toBeInTheDocument();
    }
  });

  it('Apple 로그인 버튼이 존재하지 않는다', () => {
    render(<Home />);

    expect(screen.queryByRole('button', { name: /Apple/i })).not.toBeInTheDocument();
  });
});
