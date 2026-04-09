import { useQuery } from '@tanstack/react-query';
import { useAcademyId } from '@/hooks/useAcademy';
import { fetchConnectStatus, fetchPaymentHistory } from '../api/fetchPayments';
import type { ConnectStatus, PaginatedResponse, Payment } from '@/types/api';

export function usePaymentHistory() {
  const academyId = useAcademyId();
  return useQuery<PaginatedResponse<Payment>>({
    queryKey: ['payments', 'history', academyId],
    queryFn: () =>
      fetchPaymentHistory({ academy: academyId ?? undefined, page_size: 50 }),
    enabled: !!academyId,
  });
}

export function useConnectStatus() {
  const academyId = useAcademyId();
  return useQuery<ConnectStatus>({
    queryKey: ['payments', 'connect-status', academyId],
    queryFn: () => fetchConnectStatus(academyId!),
    enabled: !!academyId,
  });
}
