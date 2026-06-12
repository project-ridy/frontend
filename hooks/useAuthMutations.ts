'use client';

import { useMutation } from '@tanstack/react-query';

import { joinWithInviteCode, registerVehicle, updateProfile, type SocialProvider } from '@/lib/auth/auth-api';
import { saveAuthTokens } from '@/lib/auth/token-storage';
import type { Role } from '@/src/graphql/generated/graphql';

export interface SocialJoinInput {
  inviteCode: string;
  provider: SocialProvider;
  oauthToken: string;
}

export interface ProfileSetupInput {
  name: string;
  phone: string;
  employeeId: string;
  isDriver: boolean;
  vehicle: {
    model: string;
    color: string;
    plate: string;
    capacity: number;
  };
}

export function useSocialJoinMutation() {
  return useMutation({
    mutationFn: async ({ inviteCode, provider, oauthToken }: SocialJoinInput) => {
      const authPayload = await joinWithInviteCode({
        inviteCode,
        provider,
        oauthToken,
        employeeId: null,
      });

      saveAuthTokens({
        accessToken: authPayload.accessToken,
        refreshToken: authPayload.refreshToken,
      });

      return authPayload;
    },
  });
}

export function useProfileSetupMutation() {
  return useMutation({
    mutationFn: async ({ name, phone, employeeId, isDriver, vehicle }: ProfileSetupInput) => {
      const role: Role = isDriver ? 'DRIVER' : 'PASSENGER';
      const user = await updateProfile({
        name,
        phone,
        employeeId,
        imageUrl: null,
        role,
      });

      if (isDriver) {
        await registerVehicle({
          model: vehicle.model,
          color: vehicle.color,
          plate: vehicle.plate,
          capacity: vehicle.capacity,
        });
      }

      return user;
    },
  });
}
