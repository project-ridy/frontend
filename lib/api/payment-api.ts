import {
  DeletePaymentMethodDocument,
  MyPaymentMethodsDocument,
  MySettlementsDocument,
  PaySettlementDocument,
  RegisterPaymentMethodDocument,
  SettlementDetailDocument,
  type DeletePaymentMethodMutation,
  type DeletePaymentMethodMutationVariables,
  type MyPaymentMethodsQuery,
  type MyPaymentMethodsQueryVariables,
  type MySettlementsQuery,
  type MySettlementsQueryVariables,
  type PaySettlementMutation,
  type PaySettlementMutationVariables,
  type RegisterPaymentMethodMutation,
  type RegisterPaymentMethodMutationVariables,
  type SettlementDetailQuery,
  type SettlementDetailQueryVariables,
} from '@/src/graphql/generated/graphql';

import { executeGraphql } from '@/lib/api/graphql-client';

export async function fetchMySettlements(
  variables: MySettlementsQueryVariables,
): Promise<MySettlementsQuery['mySettlements']> {
  const data = await executeGraphql<MySettlementsQuery, MySettlementsQueryVariables>(
    MySettlementsDocument,
    variables,
  );

  return data.mySettlements;
}

export async function fetchSettlementDetail(
  variables: SettlementDetailQueryVariables,
): Promise<NonNullable<SettlementDetailQuery['settlementDetail']>> {
  const data = await executeGraphql<SettlementDetailQuery, SettlementDetailQueryVariables>(
    SettlementDetailDocument,
    variables,
  );

  if (!data.settlementDetail) {
    throw new Error('정산 상세 응답이 비어 있습니다.');
  }

  return data.settlementDetail;
}

export async function fetchMyPaymentMethods(): Promise<MyPaymentMethodsQuery['myPaymentMethods']> {
  const data = await executeGraphql<MyPaymentMethodsQuery, MyPaymentMethodsQueryVariables>(
    MyPaymentMethodsDocument,
    {},
  );

  return data.myPaymentMethods;
}

export async function paySettlement(
  variables: PaySettlementMutationVariables,
): Promise<NonNullable<PaySettlementMutation['paySettlement']>> {
  const data = await executeGraphql<PaySettlementMutation, PaySettlementMutationVariables>(
    PaySettlementDocument,
    variables,
  );

  if (!data.paySettlement) {
    throw new Error('정산 결제 응답이 비어 있습니다.');
  }

  return data.paySettlement;
}

export async function registerPaymentMethod(
  variables: RegisterPaymentMethodMutationVariables,
): Promise<NonNullable<RegisterPaymentMethodMutation['registerPaymentMethod']>> {
  const data = await executeGraphql<RegisterPaymentMethodMutation, RegisterPaymentMethodMutationVariables>(
    RegisterPaymentMethodDocument,
    variables,
  );

  if (!data.registerPaymentMethod) {
    throw new Error('결제수단 등록 응답이 비어 있습니다.');
  }

  return data.registerPaymentMethod;
}

export async function deletePaymentMethod(
  variables: DeletePaymentMethodMutationVariables,
): Promise<NonNullable<DeletePaymentMethodMutation['deletePaymentMethod']>> {
  const data = await executeGraphql<DeletePaymentMethodMutation, DeletePaymentMethodMutationVariables>(
    DeletePaymentMethodDocument,
    variables,
  );

  if (data.deletePaymentMethod === null) {
    throw new Error('결제수단 삭제 응답이 비어 있습니다.');
  }

  return data.deletePaymentMethod;
}
