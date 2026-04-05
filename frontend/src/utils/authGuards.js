export const isAllowedStatus = (status) => {
  return status === "active" || status === "approved";
};

export const getDashboardPathByRole = (role) => {
  switch (role) {
    case "admin":
      return "/admin";
    case "organization":
      return "/organization";
    case "fidel":
      return "/fidel";
    default:
      return "/login";
  }
};