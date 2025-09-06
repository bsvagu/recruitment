import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import type { Request, Response } from "express";

const router = Router();

const createFieldDefinitionSchema = z.object({
  entityType: z.string().min(1),
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'number', 'boolean', 'date', 'select', 'multi_select', 'email', 'url', 'phone']),
  options: z.array(z.string()).optional(),
  isRequired: z.boolean().default(false),
});

const updateFieldDefinitionSchema = createFieldDefinitionSchema.partial();

const getFieldDefinitionsQuerySchema = z.object({
  entityType: z.string().optional(),
});

// GET /api/field-definitions
router.get("/", async (req: Request, res: Response) => {
  try {
    const { entityType } = getFieldDefinitionsQuerySchema.parse(req.query);
    
    const where: any = { isActive: true };
    if (entityType) {
      where.entityType = entityType;
    }

    const fieldDefinitions = await prisma.fieldDefinition.findMany({
      where,
      orderBy: { label: 'asc' },
    });
    
    res.json({ data: fieldDefinitions });
  } catch (error) {
    console.error("Error fetching field definitions:", error);
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid query parameters" : "Failed to fetch field definitions",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// POST /api/field-definitions
router.post("/", async (req: Request, res: Response) => {
  try {
    const fieldDefData = createFieldDefinitionSchema.parse(req.body);
    
    const fieldDefinition = await prisma.fieldDefinition.create({
      data: fieldDefData,
    });
    
    res.status(201).json({ data: fieldDefinition });
  } catch (error) {
    console.error("Error creating field definition:", error);
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid field definition data" : "Failed to create field definition",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// PATCH /api/field-definitions/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = updateFieldDefinitionSchema.parse(req.body);
    
    const fieldDefinition = await prisma.fieldDefinition.update({
      where: { id },
      data: updateData,
    });
    
    res.json({ data: fieldDefinition });
  } catch (error) {
    console.error("Error updating field definition:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Field definition not found" });
    }
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid field definition data" : "Failed to update field definition",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// DELETE /api/field-definitions/:id (soft delete)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.fieldDefinition.update({
      where: { id },
      data: { isActive: false },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting field definition:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Field definition not found" });
    }
    res.status(500).json({ message: "Failed to delete field definition" });
  }
});

export default router;