import { Router } from "express";
import authRoutes from "./auth";
import companiesRoutes from "./companies";
import contactsRoutes from "./contacts";
import fieldDefinitionsRoutes from "./field-definitions";
import analyticsRoutes from "./analytics";
import reportsRoutes from "./reports";

const router = Router();

// Mount all API routes
router.use("/auth", authRoutes);
router.use("/companies", companiesRoutes);
router.use("/contacts", contactsRoutes);
router.use("/field-definitions", fieldDefinitionsRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/reports", reportsRoutes);

export default router;