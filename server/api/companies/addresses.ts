import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import type { Request, Response } from "express";

const router = Router();

const createAddressSchema = z.object({
  type: z.enum(['hq', 'billing', 'shipping', 'office', 'remote', 'home', 'other']).default('other'),
  label: z.string().optional(),
  street1: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

// POST /api/companies/:id/addresses
router.post("/:id/addresses", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const addressData = createAddressSchema.parse(req.body);
    
    // Verify company exists
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company || company.isDeleted) {
      return res.status(404).json({ message: "Company not found" });
    }

    // If this is set as primary, unset other primary addresses
    if (addressData.isPrimary) {
      await prisma.address.updateMany({
        where: {
          entityType: "company",
          entityId: id,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...addressData,
        entityType: "company",
        entityId: id,
      },
    });
    
    res.status(201).json({ data: address });
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid address data" : "Failed to create address",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// GET /api/companies/:id/addresses
router.get("/:id/addresses", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const addresses = await prisma.address.findMany({
      where: {
        entityType: "company",
        entityId: id,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' },
      ],
    });
    
    res.json({ data: addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
});

// PATCH /api/companies/:companyId/addresses/:addressId
router.patch("/:companyId/addresses/:addressId", async (req: Request, res: Response) => {
  try {
    const { companyId, addressId } = req.params;
    const updateData = createAddressSchema.partial().parse(req.body);
    
    // If this is set as primary, unset other primary addresses
    if (updateData.isPrimary) {
      await prisma.address.updateMany({
        where: {
          entityType: "company",
          entityId: companyId,
          isPrimary: true,
          id: { not: addressId },
        },
        data: { isPrimary: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: updateData,
    });
    
    res.json({ data: address });
  } catch (error) {
    console.error("Error updating address:", error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid address data" : "Failed to update address",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// DELETE /api/companies/:companyId/addresses/:addressId
router.delete("/:companyId/addresses/:addressId", async (req: Request, res: Response) => {
  try {
    const { addressId } = req.params;
    
    await prisma.address.delete({
      where: { id: addressId },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting address:", error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(500).json({ message: "Failed to delete address" });
  }
});

export default router;