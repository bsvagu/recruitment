import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import type { Request, Response } from "express";

const router = Router();

const createEmailSchema = z.object({
  type: z.enum(['work', 'personal', 'sales', 'support', 'billing', 'other']).default('other'),
  email: z.string().email("Invalid email format"),
  isPrimary: z.boolean().default(false),
  isVerified: z.boolean().default(false),
});

// POST /api/companies/:id/emails
router.post("/:id/emails", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const emailData = createEmailSchema.parse(req.body);
    
    // Verify company exists
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company || company.isDeleted) {
      return res.status(404).json({ message: "Company not found" });
    }

    // If this is set as primary, unset other primary emails
    if (emailData.isPrimary) {
      await prisma.email.updateMany({
        where: {
          entityType: "company",
          entityId: id,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    const email = await prisma.email.create({
      data: {
        ...emailData,
        entityType: "company",
        entityId: id,
      },
    });
    
    res.status(201).json({ data: email });
  } catch (error) {
    console.error("Error creating email:", error);
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid email data" : "Failed to create email",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// GET /api/companies/:id/emails
router.get("/:id/emails", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const emails = await prisma.email.findMany({
      where: {
        entityType: "company",
        entityId: id,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' },
      ],
    });
    
    res.json({ data: emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ message: "Failed to fetch emails" });
  }
});

// PATCH /api/companies/:companyId/emails/:emailId
router.patch("/:companyId/emails/:emailId", async (req: Request, res: Response) => {
  try {
    const { companyId, emailId } = req.params;
    const updateData = createEmailSchema.partial().parse(req.body);
    
    // If this is set as primary, unset other primary emails
    if (updateData.isPrimary) {
      await prisma.email.updateMany({
        where: {
          entityType: "company",
          entityId: companyId,
          isPrimary: true,
          id: { not: emailId },
        },
        data: { isPrimary: false },
      });
    }

    const email = await prisma.email.update({
      where: { id: emailId },
      data: updateData,
    });
    
    res.json({ data: email });
  } catch (error) {
    console.error("Error updating email:", error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ message: "Email not found" });
    }
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid email data" : "Failed to update email",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// DELETE /api/companies/:companyId/emails/:emailId
router.delete("/:companyId/emails/:emailId", async (req: Request, res: Response) => {
  try {
    const { emailId } = req.params;
    
    await prisma.email.delete({
      where: { id: emailId },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting email:", error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ message: "Email not found" });
    }
    res.status(500).json({ message: "Failed to delete email" });
  }
});

export default router;