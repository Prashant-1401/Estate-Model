"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Paginated } from "@/lib/types";

interface UsePaginatedOptions {
  initialPerPage?: number;
  debounceMs?: number;
}

export function usePaginatedData<T>(
  endpoint: string,
  { initialPerPage = 10, debounceMs = 300 }: UsePaginatedOptions = {}
) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [perPage, setPerPageState] = useState(initialPerPage);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearchState] = useState("");
  const [status, setStatusState] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchState(searchInput);
      setPage(1);
    }, debounceMs);
    return () => clearTimeout(t);
  }, [searchInput, debounceMs]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
        if (search) params.set("search", search);
        if (status) params.set("status", status);
        const res = await api.get<Paginated<T>>(`${endpoint}?${params.toString()}`);
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setPages(res.pages);
        setError("");
        if (res.items.length === 0 && res.total > 0 && res.page > 1) {
          setPage(res.pages);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load data");
        setItems([]);
        setTotal(0);
        setPages(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [endpoint, page, perPage, search, status, refreshKey]);

  const reload = useCallback(() => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  const setPerPage = useCallback((n: number) => {
    setPerPageState(n);
    setPage(1);
  }, []);

  const setStatus = useCallback((s: string) => {
    setStatusState(s);
    setPage(1);
  }, []);

  return {
    items,
    total,
    pages,
    page,
    perPage,
    setPage,
    setPerPage,
    search: searchInput,
    setSearch: setSearchInput,
    status,
    setStatus,
    loading,
    error,
    reload,
  };
}
