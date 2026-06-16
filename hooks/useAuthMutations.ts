'use client';

import { useMutation } from '@tanstack/react-query';

import {
  completeEmailPasswordSignup,
  login,
  registerVehicle,
  requestCompanyEmailVerification,
  updateProfile,
} from '@/lib/auth/auth-api';
import { saveAuthTokens } from '@/lib/auth/token-storage';
import type { Role } from '@/src/graphql/generated/graphql';

export interface LoginCredentialsInput {
  companyEmail: string;
  password: string;
}

export interface RequestEmailVerificationInput {
  inviteCode: string;
  companyEmail: string;
}

export interface CompleteSignupInput {
  challengeId: string;
  verificationCode: string;
  password: string;
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

export function useLoginMutation() {
  return useMutation({
    mutationFn: async ({ companyEmail, password }: LoginCredentialsInput) => {
      const authPayload = await login({
        companyEmail,
        password,
      });

      saveAuthTokens({
        accessToken: authPayload.accessToken,
        refreshToken: authPayload.refreshToken,
      });

      return authPayload;
    },
  });
}

export function useRequestEmailVerificationMutation() {
  return useMutation({
    mutationFn: async ({ inviteCode, companyEmail }: RequestEmailVerificationInput) => {
      return requestCompanyEmailVerification({
        inviteCode,
        companyEmail,
      });
    },
  });
}

export function useCompleteSignupMutation() {
  return useMutation({
    mutationFn: async ({ challengeId, verificationCode, password }: CompleteSignupInput) => {
      const authPayload = await completeEmailPasswordSignup({
        challengeId,
        verificationCode,
        password,
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
