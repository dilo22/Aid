import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSheepList,
  createSheep as createSheepApi,
  updateSheep as updateSheepApi,
  deleteSheep as deleteSheepApi,
} from "../api/sheepApi";
import { DEFAULT_SHEEP_FILTERS } from "../constants/sheep";

const DEFAULT_META = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
};

export function useSheepManagement() {
  const [sheep, setSheep] = useState([]);
  const [filters, setFiltersState] = useState({
    ...DEFAULT_SHEEP_FILTERS,
    page: 1,
    limit: 20,
  });
  const [meta, setMeta] = useState(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchAll = useCallback(async (customFilters) => {
    setLoading(true);
    setError(null);

    try {
      const appliedFilters = customFilters ?? filtersRef.current;
      const data = await getSheepList(appliedFilters);

      const normalized = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];

      setSheep(normalized);
      setMeta({
        total: data?.meta?.total ?? normalized.length,
        page: data?.meta?.page ?? appliedFilters.page ?? 1,
        limit: data?.meta?.limit ?? appliedFilters.limit ?? 20,
        totalPages: data?.meta?.totalPages ?? 1,
      });

      return normalized;
    } catch (err) {
      console.error("[useSheepManagement] fetchAll error:", err);
      setError(err.message || "Erreur lors du chargement des moutons");
      setSheep([]);
      setMeta(DEFAULT_META);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(filtersRef.current);
  }, [filters, fetchAll]);

  const refresh = useCallback(() => fetchAll(), [fetchAll]);

  const updateFilters = useCallback((nextFilters) => {
    setFiltersState((prev) => {
      const next =
        typeof nextFilters === "function"
          ? nextFilters(prev)
          : { ...prev, ...nextFilters };

      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({
      ...DEFAULT_SHEEP_FILTERS,
      page: 1,
      limit: 20,
    });
  }, []);

  const goToPage = useCallback((page) => {
    setFiltersState((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit) => {
    setFiltersState((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const createSheep = useCallback(async (payload) => {
    try {
      const result = await createSheepApi(payload);
      await fetchAll();
      return result;
    } catch (err) {
      console.error("[useSheepManagement] createSheep error:", err);
      throw err;
    }
  }, [fetchAll]);

  const updateSheep = useCallback(async (id, payload) => {
    try {
      const result = await updateSheepApi(id, payload);
      await fetchAll();
      return result;
    } catch (err) {
      console.error("[useSheepManagement] updateSheep error:", err);
      throw err;
    }
  }, [fetchAll]);

  const deleteSheep = useCallback(async (id) => {
    try {
      const result = await deleteSheepApi(id);
      await fetchAll();
      return result;
    } catch (err) {
      console.error("[useSheepManagement] deleteSheep error:", err);
      throw err;
    }
  }, [fetchAll]);

  return {
    sheep,
    filters,
    meta,
    setFilters: updateFilters,
    resetFilters,
    goToPage,
    setLimit,
    loading,
    error,
    refresh,
    createSheep,
    updateSheep,
    deleteSheep,
  };
}