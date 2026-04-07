app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
    ].filter(Boolean);

    const isVercelPreview =
      origin && /^https:\/\/aid-.*\.vercel\.app$/.test(origin);

    if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.options(/.*/, cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
    ].filter(Boolean);

    const isVercelPreview =
      origin && /^https:\/\/aid-.*\.vercel\.app$/.test(origin);

    if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));