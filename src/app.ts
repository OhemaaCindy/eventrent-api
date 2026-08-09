import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";


export const app = express();

app.use(helmet());
app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Route mounting will go here as we build each module:
// app.use("/auth", authRoutes);
// app.use("/listings", listingRoutes);
// app.use("/bookings", bookingRoutes);

app.use(errorHandler);