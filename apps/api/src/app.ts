import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { env } from "./lib/env";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiDocument } from "./lib/openapi";
import { ownerRoutes } from "./routes/ownerRoutes";
import { listingRoutes } from "./routes/listingRoutes";
import { categoryRoutes } from "./routes/categoryRoutes";
import { bookingRoutes } from "./routes/bookingRoutes";
import { webhookRoutes } from "./routes/webhookRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { messageRoutes } from "./routes/messageRoutes";
import { orderRoutes } from "./routes/orderRoutes";
import { eventRoutes } from "./routes/eventRoutes";

export const app = express();

app.use(helmet());

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use("/webhooks", webhookRoutes);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Route mounting will go here as we build each module:
// app.use("/auth", authRoutes);
// app.use("/listings", listingRoutes);
// app.use("/bookings", bookingRoutes);

app.use("/auth", authRoutes);
app.use("/owners", ownerRoutes);
app.use("/listings", listingRoutes);
app.use("/categories", categoryRoutes);
app.use("/bookings", bookingRoutes);
app.use("/admin", adminRoutes);
app.use("/messages", messageRoutes);
app.use("/orders", orderRoutes);
app.use("/events", eventRoutes);

// OpenAPI documentation
const openApiDocument = generateOpenApiDocument();
app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(errorHandler);
