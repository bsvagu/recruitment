import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import type { Request, Response } from "express";

const router = Router();

const createPhoneSchema = z.object({
  type: z.enum(['work', 'personal', 'mobile', 'fax', 'other']).default('other'),
  phone: z.string().min(1, "Phone number is required"),
  isPrimary: z.boolean().default(false),
  isVerified: z.boolean().default(false),
});

// POST /api/companies/:id/phones
router.post("/:id/phones", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const phoneData = createPhoneSchema.parse(req.body);
    
    // Verify company exists
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company || company.isDeleted) {
      return res.status(404).json({ message: "Company not found" });
    }

    // If this is set as primary, unset other primary phones
    if (phoneData.isPrimary) {
      await prisma.phone.updateMany({
        where: {
          entityType: "company",
          entityId: id,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    const phone = await prisma.phone.create({
      data: {
        ...phoneData,
        entityType: "company",
        entityId: id,
      },
    });
    
    res.status(201).json({ data: phone });
  } catch (error) {
    console.error("Error creating phone:", error);
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid phone data" : "Failed to create phone",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// GET /api/companies/:id/phones
router.get("/:id/phones", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const phones = await prisma.phone.findMany({
      where: {
        entityType: "company",
        entityId: id,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' },
      ],
    });
    
    res.json({ data: phones });
  } catch (error) {
    console.error("Error fetching phones:", error);
    res.status(500).json({ message: "Failed to fetch phones" });
  }
});

// PATCH /api/companies/:companyId/phones/:phoneId
router.patch("/:companyId/phones/:phoneId", async (req: Request, res: Response) => {
  try {
    const { companyId, phoneId } = req.params;
    const updateData = createPhoneSchema.partial().parse(req.body);
    
    // If this is set as primary, unset other primary phones
    if (updateData.isPrimary) {
      await prisma.phone.updateMany({
        where: {
          entityType: "company",
          entityId: companyId,
          isPrimary: true,
          id: { not: phoneId },
        },
        data: { isPrimary: false },
      });
    }

    const phone = await prisma.phone.update({
      where: { id: phoneId },
      data: updateData,
    });
    
    res.json({ data: phone });
  } catch (error) {
    console.error("Error updating phone:", error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ message: "Phone not found" });
    }
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid phone data" : "Failed to update phone",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// DELETE /api/companies/:companyId/phones/:phoneId
router.delete("/:companyId/phones/:phoneId", async (req: Request, res: Response) => {
  try {
    const { phoneId } = req.params;
    
    await prisma.phone.delete({
      where: { id: phoneId },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting phone:", error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ message: "Phone not found" });
    }
    res.status(500).json({ message: "Failed to delete phone" });
  }
});

export default router;