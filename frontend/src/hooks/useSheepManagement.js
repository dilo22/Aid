import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSheepList,
  createSheep as createSheepApi,
  updateSheep as updateSheepApi,
  deleteSheep as deleteSheepApi,
} from "../api/sheepApi";
import { DEFAULT_SHEEP_FILTERS } from "../constants/sheep";

export function useSheepManagement() {
  const [sheep, setSheep] = useState([]);
  const [filters, setFiltersState] = useState(DEFAULT_SHEEP_FILTERS);
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
      return normalized;
    } catch (err) {
      console.error("[useSheepManagement] fetchAll error:", err);
      setError(err.message || "Erreur lors du chargement des moutons");
      setSheep([]);
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
    setFiltersState((prev) =>
      typeof nextFilters === "function"
        ? nextFilters(prev)
        : { ...prev, ...nextFilters }
    );
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_SHEEP_FILTERS);
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
    setFilters: updateFilters,
    resetFilters,
    loading,
    error,
    refresh,
    createSheep,
    updateSheep,
    deleteSheep,
  };
}