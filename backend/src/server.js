import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[SERVER] Running on port ${PORT}`);
  });
}

export default app;