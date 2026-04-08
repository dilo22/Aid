import api from "./client";

export const getAppointmentSettings = () =>
  api.get("/appointments/settings").then((r) => r.data);

export const updateAppointmentSettings = (data) =>
  api.put("/appointments/settings", data).then((r) => r.data);

export const generateAppointments = (type) =>
  api.post(`/appointments/generate/${type}`).then((r) => r.data);

export const getAppointments = (params = {}) =>
  api.get("/appointments", { params }).then((r) => r.data);

export const getMyAppointments = () =>
  api.get("/appointments/me").then((r) => r.data);

export const updateAppointment = (id, data) =>
  api.patch(`/appointments/${id}`, data).then((r) => r.data);

export const publishAppointments = (type) =>
  api.post(`/appointments/publish/${type}`).then((r) => r.data);

export const exportFideles = () =>
  api.get("/appointments/export/fideles", { responseType: "blob" }).then((r) => {
    const url  = URL.createObjectURL(new Blob([r.data], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href  = url;
    link.download = `fideles-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  });