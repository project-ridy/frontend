'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteVehicle,
  fetchMe,
  fetchMyVehicles,
  registerVehicle,
  updateProfile,
  updateVehicle,
} from '@/lib/api/profile-api';
import type {
  DeleteVehicleMutationVariables,
  RegisterVehicleMutationVariables,
  UpdateProfileMutationVariables,
  UpdateVehicleMutationVariables,
} from '@/src/graphql/generated/graphql';

export function useMeQuery() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: fetchMe,
  });
}

export function useMyVehiclesQuery() {
  return useQuery({
    queryKey: ['profile', 'vehicles'],
    queryFn: fetchMyVehicles,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateProfileMutationVariables) => updateProfile(variables),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });
}

export function useRegisterVehicleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: RegisterVehicleMutationVariables) => registerVehicle(variables),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile', 'vehicles'] }),
        queryClient.invalidateQueries({ queryKey: ['profile', 'me'] }),
      ]);
    },
  });
}

export function useUpdateVehicleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateVehicleMutationVariables) => updateVehicle(variables),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile', 'vehicles'] }),
        queryClient.invalidateQueries({ queryKey: ['profile', 'me'] }),
      ]);
    },
  });
}

export function useDeleteVehicleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: DeleteVehicleMutationVariables) => deleteVehicle(variables),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile', 'vehicles'] }),
        queryClient.invalidateQueries({ queryKey: ['profile', 'me'] }),
      ]);
    },
  });
}
