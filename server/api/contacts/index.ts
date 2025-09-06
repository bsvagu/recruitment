import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import type { Request, Response } from "express";

const router = Router();

// Validation schemas
const createContactSchema = z.object({
  prefix: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  preferredName: z.string().optional(),
  pronouns: z.string().optional(),
  headline: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  seniority: z.enum(['intern', 'entry', 'mid', 'senior', 'lead', 'principal', 'manager', 'director', 'vp', 'c_level', 'owner']).optional(),
  companyId: z.string().optional(),
  companyNameSnapshot: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  locationLabel: z.string().optional(),
  timeZone: z.string().optional(),
  employmentStartDate: z.coerce.date().optional(),
  employmentEndDate: z.coerce.date().optional(),
  isCurrentEmployee: z.boolean().default(true),
  employmentHistory: z.array(z.any()).optional(),
  lifecycleStage: z.enum(['subscriber', 'lead', 'marketing_qualified_lead', 'sales_qualified_lead', 'opportunity', 'customer', 'evangelist', 'other']).optional(),
  recordStatus: z.enum(['active', 'inactive', 'archived']).optional(),
  ownerId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
});

const updateContactSchema = createContactSchema.partial();

const getContactsQuerySchema = z.object({
  q: z.string().optional(),
  companyId: z.string().optional(),
  seniority: z.string().optional(),
  lifecycleStage: z.string().optional(),
  recordStatus: z.string().optional(),
  country: z.string().optional(),
  sort: z.string().default("updatedAt:desc"),
  limit: z.coerce.number().min(1).max(100).default(25),
  cursor: z.string().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  include: z.string().optional(),
});

// GET /api/contacts
router.get("/", async (req: Request, res: Response) => {
  try {
    const params = getContactsQuerySchema.parse(req.query);
    
    const where: any = {};
    
    // Base condition - exclude deleted unless specified
    if (!params.includeDeleted) {
      where.isDeleted = false;
    }

    // Search query
    if (params.q) {
      where.OR = [
        { firstName: { contains: params.q, mode: 'insensitive' } },
        { lastName: { contains: params.q, mode: 'insensitive' } },
        { title: { contains: params.q, mode: 'insensitive' } },
        { headline: { contains: params.q, mode: 'insensitive' } },
        { companyNameSnapshot: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (params.companyId) where.companyId = params.companyId;
    if (params.seniority) where.seniority = params.seniority;
    if (params.lifecycleStage) where.lifecycleStage = params.lifecycleStage;
    if (params.recordStatus) where.recordStatus = params.recordStatus;

    // Cursor pagination
    if (params.cursor) {
      where.updatedAt = { lt: new Date(params.cursor) };
    }

    // Sorting
    const [sortField, sortOrder] = params.sort.split(":");
    const orderBy: any = {};
    orderBy[sortField] = sortOrder || "desc";

    // Include related data
    const include: any = {};
    if (params.include) {
      const includeFields = params.include.split(",");
      if (includeFields.includes("addresses")) include.addresses = true;
      if (includeFields.includes("emails")) include.emails = true;
      if (includeFields.includes("phones")) include.phones = true;
      if (includeFields.includes("company")) include.company = true;
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy,
      take: params.limit + 1, // Take one extra to check if there's a next page
      include,
    });

    const hasNext = contacts.length > params.limit;
    const result = hasNext ? contacts.slice(0, -1) : contacts;

    // Get total count
    const total = await prisma.contact.count({
      where: params.includeDeleted ? {} : { isDeleted: false },
    });

    const nextCursor = hasNext && result.length > 0 
      ? result[result.length - 1].updatedAt.toISOString()
      : null;

    res.json({
      data: result,
      meta: {
        count: result.length,
        total,
        hasNext,
      },
      links: {
        next: nextCursor ? `/api/contacts?cursor=${nextCursor}&limit=${params.limit}` : null,
      },
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid query parameters" : "Failed to fetch contacts",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// GET /api/contacts/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { include } = req.query;
    
    const includeOptions: any = {};
    if (include) {
      const includeFields = include.toString().split(",");
      if (includeFields.includes("addresses")) includeOptions.addresses = true;
      if (includeFields.includes("emails")) includeOptions.emails = true;
      if (includeFields.includes("phones")) includeOptions.phones = true;
      if (includeFields.includes("company")) includeOptions.company = true;
    }

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: includeOptions,
    });
    
    if (!contact || contact.isDeleted) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ data: contact });
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({ message: "Failed to fetch contact" });
  }
});

// POST /api/contacts
router.post("/", async (req: Request, res: Response) => {
  try {
    const contactData = createContactSchema.parse(req.body);
    
    const contact = await prisma.contact.create({
      data: contactData,
    });
    
    res.status(201).json({ data: contact });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid contact data" : "Failed to create contact",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// PATCH /api/contacts/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = updateContactSchema.parse(req.body);
    
    const contact = await prisma.contact.update({
      where: { id },
      data: updateData,
    });
    
    res.json({ data: contact });
  } catch (error) {
    console.error("Error updating contact:", error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid contact data" : "Failed to update contact",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// DELETE /api/contacts/:id (soft delete)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.contact.update({
      where: { id },
      data: { isDeleted: true },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting contact:", error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(500).json({ message: "Failed to delete contact" });
  }
});

export default router;