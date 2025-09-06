import { Router } from "express";
import authRoutes from "./auth";
import companiesMainRoutes from "./companies";
import companiesAddressRoutes from "./companies/addresses";
import companiesEmailRoutes from "./companies/emails";
import companiesPhoneRoutes from "./companies/phones";
import contactsMainRoutes from "./contacts";
import contactsAddressRoutes from "./contacts/addresses";
import contactsEmailRoutes from "./contacts/emails";
import contactsPhoneRoutes from "./contacts/phones";
import fieldDefinitionsRoutes from "./field-definitions";
import analyticsRoutes from "./analytics";
import reportsRoutes from "./reports";

const router = Router();

// Mount all API routes
router.use("/auth", authRoutes);
router.use("/companies", companiesMainRoutes);
router.use("/companies", companiesAddressRoutes);
router.use("/companies", companiesEmailRoutes);
router.use("/companies", companiesPhoneRoutes);
router.use("/contacts", contactsMainRoutes);
router.use("/contacts", contactsAddressRoutes);
router.use("/contacts", contactsEmailRoutes);
router.use("/contacts", contactsPhoneRoutes);
router.use("/field-definitions", fieldDefinitionsRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/reports", reportsRoutes);

export default router;