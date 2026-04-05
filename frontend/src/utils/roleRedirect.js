export const getDashboardPath = (profile) => {
  if (!profile) return "/login";

  if (profile.status === "pending") {
    return "/pending-approval";
  }

  switch (profile.role) {
    case "admin":
      return "/admin";

    case "organization":
      return "/organization";

    case "fidel":
      return "/fidel";

    default:
      return "/";
  }
};