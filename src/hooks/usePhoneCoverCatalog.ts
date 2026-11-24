import { useQuery } from '@tanstack/react-query';
import { apiFetch, endpoints } from '@/lib/api';
import type { PhoneCoverCatalog } from '@/lib/phoneCoverCatalog';

export const PHONE_COVER_CATALOG_QUERY_KEY = ['phone-cover-catalog'] as const;

export const usePhoneCoverCatalog = () =>
  useQuery<PhoneCoverCatalog, Error>({
    queryKey: PHONE_COVER_CATALOG_QUERY_KEY,
    queryFn: () => apiFetch<PhoneCoverCatalog>(endpoints.phoneCover.catalog),
    staleTime: 5 * 60 * 1000,
  });

