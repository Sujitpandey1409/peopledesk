import cors from "cors";
import express from "express";
import errorHandler from "./middleware/errorHandler";
import employeeRoutes from "./routes/employeeRoutes";

const app = express();
const clientOrigin = new URL(
  process.env.CLIENT_URL?.trim() || "http://localhost:5173",
).origin;

app.use(
  cors({
    origin: clientOrigin,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "PeopleDesk API is running",
  });
});

app.use("/employees", employeeRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "The requested resource was not found.",
  });
});

app.use(errorHandler);

export default app;