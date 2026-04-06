export const getAuthErrorMessage = (error) => {
  const message = error?.message || "";

  if (message.includes("Invalid login credentials")) {
    // ✅ Message neutre — ne révèle pas si l'email existe
    return "Email ou mot de passe incorrect.";
  }
  if (message.includes("Email not confirmed")) {
    return "Votre email n'est pas encore confirmé.";
  }
  if (message.includes("Password should be at least")) {
    return "Le mot de passe est trop court.";
  }
  if (message.includes("Unable to validate email address")) {
    return "Adresse email invalide.";
  }
  if (message.includes("Email rate limit exceeded")) {
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  }
  if (message.includes("over_email_send_rate_limit")) {
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  }
  if (message.includes("New password should be different")) {
    return "Le nouveau mot de passe doit être différent de l'ancien.";
  }
  if (message.includes("Token has expired") || message.includes("token")) {
    return "Le lien a expiré. Recommencez la procédure.";
  }
  if (message.includes("Invalid token")) {
    return "Lien invalide ou déjà utilisé.";
  }
  if (message.includes("User not found")) {
    // ✅ Message neutre — ne confirme pas l'absence du compte
    return "Email ou mot de passe incorrect.";
  }

  return "Une erreur est survenue. Veuillez réessayer.";
};