export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);

    // ✅ Nom lisible dans les logs
    this.name = "ApiError";
    this.statusCode = statusCode;

    // ✅ Stack trace pointe sur l'appelant, pas sur ce constructeur
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}