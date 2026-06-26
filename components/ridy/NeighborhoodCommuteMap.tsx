'use client';

import { MapPin } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DEFAULT_NEARBY_CENTER,
  NEARBY_COMMUTE_RADIUS_OPTIONS,
  type NearbyCenter,
  type NearbyRadiusKm,
} from '@/hooks/useMatchingQueries';
import { cn } from '@/lib/utils';
import type { NearbyCommuteOffersQuery } from '@/src/graphql/generated/graphql';

type NearbyRideMarker = NonNullable<NearbyCommuteOffersQuery['nearbyCommuteOffers']>['nodes'][number];

const MAP_LEVEL_BY_RADIUS: Record<NearbyRadiusKm, number> = {
  1: 6,
  2: 7,
  5: 8,
};

interface KakaoLatLng {
  new (lat: number, lng: number): unknown;
}

interface KakaoMap {
  new (container: HTMLElement, options: { center: unknown; level: number }): unknown;
}

interface KakaoMarker {
  new (options: { position: unknown; map: unknown }): unknown;
}

interface KakaoCircle {
  new (options: {
    center: unknown;
    radius: number;
    strokeWeight: number;
    strokeColor: string;
    strokeOpacity: number;
    strokeStyle: string;
    fillColor: string;
    fillOpacity: number;
    map: unknown;
  }): unknown;
}

interface KakaoMaps {
  LatLng: KakaoLatLng;
  Map: KakaoMap;
  Marker?: KakaoMarker;
  Circle?: KakaoCircle;
  load(callback: () => void): void;
}

declare global {
  interface Window {
    kakao?: { maps?: KakaoMaps };
  }
}

interface NeighborhoodCommuteMapProps {
  className?: string;
  radiusKm: NearbyRadiusKm;
  rides?: readonly NearbyRideMarker[];
  onRadiusChange: (radiusKm: NearbyRadiusKm) => void;
  onCenterChange?: (center: NearbyCenter) => void;
  onRideSelect?: (rideId: string) => void;
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

export function NeighborhoodCommuteMap({
  className,
  radiusKm,
  rides = [],
  onRadiusChange,
  onCenterChange,
  onRideSelect,
}: NeighborhoodCommuteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'ready' | 'fallback'>('ready');
  const [locationStatus, setLocationStatus] = useState('현재 위치를 사용하면 주변 회사행 카풀을 더 정확히 보여줍니다.');
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;

  const [center, setCenter] = useState<NearbyCenter>(DEFAULT_NEARBY_CENTER);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('위치 정보를 지원하지 않아 회사 근무지 기준으로 보여줍니다.');
      return;
    }

    setLocationStatus('현재 위치 확인 중입니다.');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCenter = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCenter(nextCenter);
        onCenterChange?.(nextCenter);
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
        const map = new maps.Map(mapRef.current, { center: position, level: MAP_LEVEL_BY_RADIUS[radiusKm] });
        if (maps.Marker) {
          new maps.Marker({ position, map });
        }
        if (maps.Circle) {
          new maps.Circle({
            center: position,
            radius: radiusKm * 1000,
            strokeWeight: 2,
            strokeColor: '#2563eb',
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            fillColor: '#2563eb',
            fillOpacity: 0.08,
            map,
          });
        }
      })
      .catch(() => setStatus('fallback'));

    return () => {
      cancelled = true;
    };
  }, [appKey, center, radiusKm]);

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

        <div className="relative h-[calc(100%-5rem)] bg-primary-subtle/40">
          <div ref={mapRef} className="h-full" aria-label="회사 근무지 주변 지도" />
          {status === 'fallback' ? (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/70 bg-primary/8"
              aria-hidden="true"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0" aria-label="주변 카풀 지도 마커">
            {rides.map((ride, index) => (
              <button
                key={ride.id}
                type="button"
                className="pointer-events-auto absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-primary shadow-2 transition-transform duration-fast hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                style={getMarkerPosition(index)}
                aria-label={`${ride.driver.name} 지도 마커`}
                title={`${ride.driver.name} · ${ride.pickupLabel}`}
                onClick={() => onRideSelect?.(ride.id)}
              />
            ))}
          </div>
          <div className="absolute left-4 top-4 space-y-2">
            <div className="flex gap-2 rounded-pill border border-primary/20 bg-surface/90 p-1 shadow-1 backdrop-blur-xl" aria-label="반경 선택">
              {NEARBY_COMMUTE_RADIUS_OPTIONS.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={radiusKm === option ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 rounded-full px-3 text-caption"
                  aria-pressed={radiusKm === option}
                  onClick={() => onRadiusChange(option)}
                >
                  {option}km
                </Button>
              ))}
            </div>
            <p className="rounded-pill border border-primary/20 bg-surface/90 px-3 py-1 text-caption font-semibold text-primary shadow-1">
              {radiusKm}km 반경 안의 카풀만 표시합니다.
            </p>
          </div>
        </div>

        {status === 'fallback' ? (
          <p className="border-t border-border-subtle px-4 py-3 text-caption text-text-secondary">
            지도 SDK를 불러오지 못해 목록 fallback으로 주변 카풀을 확인합니다.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function getMarkerPosition(index: number): CSSProperties {
  const positions = [
    { left: '35%', top: '42%' },
    { left: '58%', top: '36%' },
    { left: '66%', top: '55%' },
    { left: '44%', top: '62%' },
  ] as const;

  return positions[index % positions.length];
}
