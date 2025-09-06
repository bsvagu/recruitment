import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import apiRoutes from "./api";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount all API routes
  app.use("/api", apiRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
