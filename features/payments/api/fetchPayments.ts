import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  CheckoutRequest,
  CheckoutResponse,
  ConnectStatus,
  DashboardResponse,
  OnboardingResponse,
  PaginatedResponse,
  Payment,
  SeminarCheckoutRequest,
} from '@/types/api';

export async function fetchPaymentHistory(params: {
  academy?: number;
  page_size?: number;
}): Promise<PaginatedResponse<Payment>> {
  const { data } = await apiClient.get<PaginatedResponse<Payment>>(
    ENDPOINTS.PAYMENTS.HISTORY,
    { params },
  );
  return data;
}

export async function fetchConnectStatus(
  academyId: number,
): Promise<ConnectStatus> {
  const { data } = await apiClient.get<ConnectStatus>(
    ENDPOINTS.PAYMENTS.CONNECT_STATUS(academyId),
  );
  return data;
}

export async function startAcademyOnboarding(
  academyId: number,
): Promise<OnboardingResponse> {
  const { data } = await apiClient.post<OnboardingResponse>(
    ENDPOINTS.PAYMENTS.ACADEMY_ONBOARDING,
    { academy: academyId },
  );
  return data;
}

export async function getAcademyDashboard(
  academyId: number,
): Promise<DashboardResponse> {
  const { data } = await apiClient.post<DashboardResponse>(
    ENDPOINTS.PAYMENTS.ACADEMY_DASHBOARD(academyId),
  );
  return data;
}

export async function createCheckout(
  payload: CheckoutRequest,
): Promise<CheckoutResponse> {
  const { data } = await apiClient.post<CheckoutResponse>(
    ENDPOINTS.PAYMENTS.CHECKOUT,
    payload,
  );
  return data;
}

export async function createSeminarCheckout(
  payload: SeminarCheckoutRequest,
): Promise<CheckoutResponse> {
  const { data } = await apiClient.post<CheckoutResponse>(
    ENDPOINTS.PAYMENTS.SEMINAR_CHECKOUT,
    payload,
  );
  return data;
}
