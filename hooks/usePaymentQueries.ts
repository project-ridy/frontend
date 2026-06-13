'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deletePaymentMethod,
  fetchMyPaymentMethods,
  fetchMySettlements,
  fetchSettlementDetail,
  paySettlement,
  registerPaymentMethod,
} from '@/lib/api/payment-api';
import type {
  DeletePaymentMethodMutationVariables,
  MySettlementsQueryVariables,
  PaySettlementMutationVariables,
  RegisterPaymentMethodMutationVariables,
} from '@/src/graphql/generated/graphql';

export function useMySettlementsQuery() {
  const variables: MySettlementsQueryVariables = {
    pagination: {
      first: 30,
      after: null,
    },
  };

  return useQuery({
    queryKey: ['payment', 'settlements', variables],
    queryFn: () => fetchMySettlements(variables),
  });
}

export function useSettlementDetailQuery(id: string | null) {
  return useQuery({
    queryKey: ['payment', 'settlement', id],
    queryFn: () => {
      if (!id) {
        throw new Error('정산 ID가 없습니다.');
      }

      return fetchSettlementDetail({ id });
    },
    enabled: Boolean(id),
  });
}

export function useMyPaymentMethodsQuery() {
  return useQuery({
    queryKey: ['payment', 'methods'],
    queryFn: fetchMyPaymentMethods,
  });
}

export function usePaySettlementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: PaySettlementMutationVariables) => paySettlement(variables),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['payment', 'settlements'] }),
        queryClient.invalidateQueries({ queryKey: ['payment', 'settlement', variables.settlementId] }),
      ]);
    },
  });
}

export function useRegisterPaymentMethodMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: RegisterPaymentMethodMutationVariables) => registerPaymentMethod(variables),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['payment', 'methods'] });
    },
  });
}

export function useDeletePaymentMethodMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: DeletePaymentMethodMutationVariables) => deletePaymentMethod(variables),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['payment', 'methods'] });
    },
  });
}
