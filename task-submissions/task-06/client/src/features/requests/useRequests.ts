import { useCallback, useEffect, useState } from 'react';
import { isAbortError } from '../../api/http';
import { listRequests } from '../../api/requests';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { messageFromError } from '../../utils/errors';
import {
  EMPTY_FILTERS,
  type ListFilters,
  type ListMeta,
  type ServiceRequest,
} from '../../types/serviceRequest';

/** Loads the request list from the API and keeps filters, paging and load state together. */
export function useRequests() {
  const [filters, setFilters] = useState<ListFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearch = useDebouncedValue(filters.search, 300);
  const { status, priority, category } = filters;

  useEffect(() => {
    const controller = new AbortController();
    setIsFetching(true);
    setError(null);

    listRequests({ search: debouncedSearch, status, priority, category }, page, controller.signal)
      .then((response) => {
        if (response.meta.totalPages > 0 && page > response.meta.totalPages) {
          setPage(response.meta.totalPages); // e.g. the last item on the last page was deleted
          return;
        }
        setItems(response.data);
        setMeta(response.meta);
        setHasLoaded(true);
        setIsFetching(false);
      })
      .catch((caught: unknown) => {
        if (isAbortError(caught)) return;
        setError(messageFromError(caught));
        setIsFetching(false);
      });

    return () => controller.abort();
  }, [debouncedSearch, status, priority, category, page, reloadToken]);

  const updateFilters = useCallback((patch: Partial<ListFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const hasActiveFilters =
    filters.search.trim() !== '' || status !== '' || priority !== '' || category !== '';

  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    page,
    setPage,
    items,
    meta,
    error,
    hasLoaded,
    isFetching,
    reload,
  };
}
