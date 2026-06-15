'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchEcoImpactDashboard } from '@/lib/api/eco-impact-api';
import type { EcoImpactDashboardQueryVariables } from '@/src/graphql/generated/graphql';

const DEFAULT_ECO_IMPACT_VARIABLES: EcoImpactDashboardQueryVariables = {
  period: 'all',
  pagination: {
    first: 10,
    after: null,
  },
};

export function useEcoImpactDashboardQuery(
  variables: EcoImpactDashboardQueryVariables = DEFAULT_ECO_IMPACT_VARIABLES,
) {
  return useQuery({
    queryKey: ['eco-impact', 'dashboard', variables],
    queryFn: () => fetchEcoImpactDashboard(variables),
  });
}
