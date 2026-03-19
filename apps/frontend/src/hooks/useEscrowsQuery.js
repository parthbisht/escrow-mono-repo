import { useQuery } from '@tanstack/react-query';
import { backendApi } from '../services/backendApi';

export function useEscrowsQuery(params) {
  return useQuery({
    queryKey: ['escrows', params],
    queryFn: () => backendApi.listEscrows(params)
  });
}
