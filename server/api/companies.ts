import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import type { Request, Response } from "express";

const router = Router();

// Validation schemas
const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  legalName: z.string().optional(),
  emailDomains: z.array(z.string()).optional(),
  companyType: z.enum(['public', 'private', 'nonprofit', 'government', 'partnership', 'sole_proprietorship']).optional(),
  employeeCountRange: z.enum(['one', 'two_to_ten', 'eleven_to_fifty', 'fifty_one_to_two_hundred', 'two_hundred_one_to_five_hundred', 'five_hundred_one_to_one_thousand', 'one_thousand_one_to_five_thousand', 'five_thousand_one_to_ten_thousand', 'ten_thousand_plus']).optional(),
  industry: z.enum(['technology', 'finance', 'healthcare', 'retail', 'manufacturing', 'consulting', 'education', 'real_estate', 'transportation', 'energy', 'media', 'hospitality']).optional(),
  specialties: z.array(z.string()).optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  lifecycleStage: z.enum(['subscriber', 'lead', 'marketing_qualified_lead', 'sales_qualified_lead', 'opportunity', 'customer', 'evangelist', 'other']).optional(),
  recordStatus: z.enum(['active', 'inactive', 'archived']).optional(),
  ownerId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
});

const updateCompanySchema = createCompanySchema.partial();

const getCompaniesQuerySchema = z.object({
  q: z.string().optional(),
  industry: z.string().optional(),
  companyType: z.string().optional(),
  employeeCountRange: z.string().optional(),
  recordStatus: z.string().optional(),
  country: z.string().optional(),
  sort: z.string().default("updatedAt:desc"),
  limit: z.coerce.number().min(1).max(100).default(25),
  cursor: z.string().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  include: z.string().optional(),
});

// GET /api/companies
router.get("/", async (req: Request, res: Response) => {
  try {
    const params = getCompaniesQuerySchema.parse(req.query);
    
    const where: any = {};
    
    // Base condition - exclude deleted unless specified
    if (!params.includeDeleted) {
      where.isDeleted = false;
    }

    // Search query
    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: 'insensitive' } },
        { legalName: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
        { emailDomains: { has: params.q } },
      ];
    }

    // Filters
    if (params.industry) where.industry = params.industry;
    if (params.companyType) where.companyType = params.companyType;
    if (params.employeeCountRange) where.employeeCountRange = params.employeeCountRange;
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
      if (includeFields.includes("contacts")) include.contacts = true;
    }

    const companies = await prisma.company.findMany({
      where,
      orderBy,
      take: params.limit + 1, // Take one extra to check if there's a next page
      include,
    });

    const hasNext = companies.length > params.limit;
    const result = hasNext ? companies.slice(0, -1) : companies;

    // Get total count
    const total = await prisma.company.count({
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
        next: nextCursor ? `/api/companies?cursor=${nextCursor}&limit=${params.limit}` : null,
      },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid query parameters" : "Failed to fetch companies",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// GET /api/companies/:id
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
      if (includeFields.includes("contacts")) includeOptions.contacts = true;
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: includeOptions,
    });
    
    if (!company || company.isDeleted) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ data: company });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ message: "Failed to fetch company" });
  }
});

// POST /api/companies
router.post("/", async (req: Request, res: Response) => {
  try {
    const companyData = createCompanySchema.parse(req.body);
    
    const company = await prisma.company.create({
      data: companyData,
    });
    
    res.status(201).json({ data: company });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid company data" : "Failed to create company",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// PATCH /api/companies/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = updateCompanySchema.parse(req.body);
    
    const company = await prisma.company.update({
      where: { id },
      data: updateData,
    });
    
    res.json({ data: company });
  } catch (error) {
    console.error("Error updating company:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid company data" : "Failed to update company",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

// DELETE /api/companies/:id (soft delete)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.company.update({
      where: { id },
      data: { isDeleted: true },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting company:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(500).json({ message: "Failed to delete company" });
  }
});

// POST /api/companies/:id/addresses
router.post("/:id/addresses", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verify company exists
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company || company.isDeleted) {
      return res.status(404).json({ message: "Company not found" });
    }

    const addressData = {
      ...req.body,
      entityType: "company",
      entityId: id,
    };
    
    const address = await prisma.address.create({
      data: addressData,
    });
    
    res.status(201).json({ data: address });
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(400).json({ message: "Failed to create address" });
  }
});

// POST /api/companies/:id/emails
router.post("/:id/emails", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verify company exists
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company || company.isDeleted) {
      return res.status(404).json({ message: "Company not found" });
    }

    const emailData = {
      ...req.body,
      entityType: "company",
      entityId: id,
    };
    
    const email = await prisma.email.create({
      data: emailData,
    });
    
    res.status(201).json({ data: email });
  } catch (error) {
    console.error("Error creating email:", error);
    res.status(400).json({ message: "Failed to create email" });
  }
});

// POST /api/companies/:id/phones
router.post("/:id/phones", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verify company exists
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company || company.isDeleted) {
      return res.status(404).json({ message: "Company not found" });
    }

    const phoneData = {
      ...req.body,
      entityType: "company",
      entityId: id,
    };
    
    const phone = await prisma.phone.create({
      data: phoneData,
    });
    
    res.status(201).json({ data: phone });
  } catch (error) {
    console.error("Error creating phone:", error);
    res.status(400).json({ message: "Failed to create phone" });
  }
});

export default router;