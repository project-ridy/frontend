'use client';

import { MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COMPANY_POSITION = { lat: 37.2636, lng: 127.0286 };

interface KakaoLatLng {
  new (lat: number, lng: number): unknown;
}

interface KakaoMap {
  new (container: HTMLElement, options: { center: unknown; level: number }): unknown;
}

interface KakaoMarker {
  new (options: { position: unknown; map: unknown }): unknown;
}

interface KakaoMaps {
  LatLng: KakaoLatLng;
  Map: KakaoMap;
  Marker?: KakaoMarker;
  load(callback: () => void): void;
}

declare global {
  interface Window {
    kakao?: { maps?: KakaoMaps };
  }
}

interface NeighborhoodCommuteMapProps {
  className?: string;
}

let kakaoMapsPromise: Promise<KakaoMaps | undefined> | null = null;

function loadKakaoMaps(appKey: string): Promise<KakaoMaps | undefined> {
  if (window.kakao?.maps) {
    return new Promise((resolve) => window.kakao?.maps?.load(() => resolve(window.kakao?.maps)));
  }

  kakaoMapsPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao?.maps?.load(() => resolve(window.kakao?.maps));
    script.onerror = () => reject(new Error('Kakao Maps SDK load failed'));
    document.head.appendChild(script);
  });

  return kakaoMapsPromise;
}

export function NeighborhoodCommuteMap({ className }: NeighborhoodCommuteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'ready' | 'fallback'>('ready');
  const [locationStatus, setLocationStatus] = useState('현재 위치를 사용하면 주변 회사행 카풀을 더 정확히 보여줍니다.');
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;

  const [center, setCenter] = useState(COMPANY_POSITION);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('위치 정보를 지원하지 않아 회사 근무지 기준으로 보여줍니다.');
      return;
    }

    setLocationStatus('현재 위치 확인 중입니다.');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus('현재 위치 기준으로 주변 카풀을 보여줍니다.');
      },
      () => setLocationStatus('위치 권한이 없어 회사 근무지 기준으로 보여줍니다.'),
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 5_000 },
    );
  };

  useEffect(() => {
    if (!appKey || !mapRef.current) {
      setStatus('fallback');
      return;
    }

    let cancelled = false;

    loadKakaoMaps(appKey)
      .then((maps) => {
        if (cancelled || !mapRef.current || !maps) return;
        const position = new maps.LatLng(center.lat, center.lng);
        const map = new maps.Map(mapRef.current, { center: position, level: 5 });
        if (maps.Marker) {
          new maps.Marker({ position, map });
        }
      })
      .catch(() => setStatus('fallback'));

    return () => {
      cancelled = true;
    };
  }, [appKey, center]);

  return (
    <section className={cn(className ?? 'mt-6')} aria-label="동네 주변 회사행 카풀 지도">
      <div className="h-full overflow-hidden rounded-ridy-xl border border-border-default bg-surface shadow-2">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-caption font-semibold text-primary">Kakao 지도</p>
            <h2 className="text-h3 text-gray-900">테크스타터 출근길</h2>
            <p className="mt-1 text-caption text-text-secondary">{locationStatus}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleUseCurrentLocation}>
            <MapPin aria-hidden="true" size={16} />
            현재 위치 사용
          </Button>
        </div>

        <div ref={mapRef} className="h-[calc(100%-5rem)] bg-primary-subtle/40" aria-label="회사 근무지 주변 지도" />

        {status === 'fallback' ? (
          <p className="border-t border-border-subtle px-4 py-3 text-caption text-text-secondary">
            지도 SDK를 불러오지 못해 목록 fallback으로 주변 카풀을 확인합니다.
          </p>
        ) : null}
      </div>
    </section>
  );
}
