import { useCallback, useEffect, useState } from "react";
import {
  getSheepList,
  createSheep as createSheepApi,
  updateSheep as updateSheepApi,
  deleteSheep as deleteSheepApi,
} from "../api/sheepApi";
import { DEFAULT_SHEEP_FILTERS } from "../constants/sheep";

export function useSheepManagement() {
  const [sheep, setSheep] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_SHEEP_FILTERS);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async (customFilters) => {
    setLoading(true);

    try {
      const appliedFilters = customFilters ?? filters;
      const data = await getSheepList(appliedFilters);

      const normalizedSheep = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];

      setSheep(normalizedSheep);
      return normalizedSheep;
    } catch (error) {
      console.error("useSheepManagement error:", error);
      setSheep([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refresh = useCallback(async () => {
    return fetchAll();
  }, [fetchAll]);

  const updateFilters = useCallback((nextFilters) => {
    setFilters((prev) => {
      if (typeof nextFilters === "function") {
        return nextFilters(prev);
      }

      return {
        ...prev,
        ...nextFilters,
      };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_SHEEP_FILTERS);
  }, []);

  const createSheep = useCallback(async (payload) => {
    const result = await createSheepApi(payload);
    await fetchAll();
    return result;
  }, [fetchAll]);

  const updateSheep = useCallback(async (id, payload) => {
    const result = await updateSheepApi(id, payload);
    await fetchAll();
    return result;
  }, [fetchAll]);

  const deleteSheep = useCallback(async (id) => {
    const result = await deleteSheepApi(id);
    await fetchAll();
    return result;
  }, [fetchAll]);

  return {
    sheep,
    filters,
    setFilters: updateFilters,
    resetFilters,
    loading,
    refresh,
    createSheep,
    updateSheep,
    deleteSheep,
  };
}