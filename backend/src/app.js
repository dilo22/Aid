import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "API OK" });
});

app.use("/api", routes);
app.use(errorMiddleware);

export default app;