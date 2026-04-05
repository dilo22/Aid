import { supabase } from "../lib/supabase";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAccessToken = async (providedToken) => {
  if (providedToken) return providedToken;

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message || "Impossible de récupérer la session");
  }

  const token = session?.access_token;

  if (!token) {
    throw new Error("Utilisateur non authentifié");
  }

  return token;
};

const apiFetch = async (path, options = {}, providedToken) => {
  const token = await getAccessToken(providedToken);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Erreur API");
  }

  return data;
};

const normalizeArrayResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const getPendingProfiles = async (token) => {
  const data = await apiFetch("/profiles/pending", { method: "GET" }, token);
  return normalizeArrayResponse(data);
};

export const getApprovedProfiles = async (token) => {
  const data = await apiFetch("/profiles/approved", { method: "GET" }, token);
  return normalizeArrayResponse(data);
};

export const getProfiles = async (filters = {}, token) => {
  const status = filters.status || "all";

  let profiles = [];

  if (status === "pending") {
    profiles = await getPendingProfiles(token);
  } else if (status === "approved") {
    profiles = await getApprovedProfiles(token);
  } else {
    const [pending, approved] = await Promise.all([
      getPendingProfiles(token),
      getApprovedProfiles(token),
    ]);

    profiles = [...pending, ...approved].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }

  if (filters.role && filters.role !== "all") {
    profiles = profiles.filter(
      (item) => String(item.role || "") === filters.role
    );
  }

  if (filters.organization_id && filters.organization_id !== "all") {
    profiles = profiles.filter(
      (item) => String(item.organization_id || "") === filters.organization_id
    );
  }

  return profiles;
};

export const registerFidel = async (payload, token) => {
  return apiFetch(
    "/profiles/create-fidel",
    {
      method: "POST",
      body: JSON.stringify({
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone,
        organization_id: payload.organization_id || null,
      }),
    },
    token
  );
};

export const approveProfile = async (id, token) => {
  return apiFetch(`/profiles/${id}/approve`, { method: "PATCH" }, token);
};

export const getOrganizationFidels = async (params = {}, token) => {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }

  const query = searchParams.toString();

  return apiFetch(
    `/organizations/me/fidels${query ? `?${query}` : ""}`,
    { method: "GET" },
    token
  );
};

export const createOrganizationFidel = async (payload, token) => {
  return apiFetch(
    "/organizations/me/fidels",
    {
      method: "POST",
      body: JSON.stringify({
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone,
      }),
    },
    token
  );
};

export const updateOrganizationFidel = async (id, payload, token) => {
  return apiFetch(
    `/organizations/me/fidels/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone,
        status: payload.status,
      }),
    },
    token
  );
};

export const deleteOrganizationFidel = async (id, token) => {
  return apiFetch(
    `/organizations/me/fidels/${id}`,
    {
      method: "DELETE",
    },
    token
  );
};

export const createProfile = async () => {
  throw new Error(
    "createProfile n'est plus autorisé en direct. Utilise registerFidel ou createOrganizationFidel."
  );
};

export const updateProfile = async () => {
  throw new Error(
    "updateProfile n'est pas encore branché côté backend admin."
  );
};

export const deleteProfile = async () => {
  throw new Error(
    "deleteProfile n'est pas encore branché côté backend admin."
  );
};