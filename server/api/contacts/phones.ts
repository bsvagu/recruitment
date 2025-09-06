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

// POST /api/contacts/:id/phones
router.post("/:id/phones", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const phoneData = createPhoneSchema.parse(req.body);
    
    // Verify contact exists
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact || contact.isDeleted) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // If this is set as primary, unset other primary phones
    if (phoneData.isPrimary) {
      await prisma.phone.updateMany({
        where: {
          entityType: "contact",
          entityId: id,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    const phone = await prisma.phone.create({
      data: {
        ...phoneData,
        entityType: "contact",
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

// GET /api/contacts/:id/phones
router.get("/:id/phones", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const phones = await prisma.phone.findMany({
      where: {
        entityType: "contact",
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

// PATCH /api/contacts/:contactId/phones/:phoneId
router.patch("/:contactId/phones/:phoneId", async (req: Request, res: Response) => {
  try {
    const { contactId, phoneId } = req.params;
    const updateData = createPhoneSchema.partial().parse(req.body);
    
    // If this is set as primary, unset other primary phones
    if (updateData.isPrimary) {
      await prisma.phone.updateMany({
        where: {
          entityType: "contact",
          entityId: contactId,
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

// DELETE /api/contacts/:contactId/phones/:phoneId
router.delete("/:contactId/phones/:phoneId", async (req: Request, res: Response) => {
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