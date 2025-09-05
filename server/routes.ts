import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertContactSchema, insertUserSchema, insertAddressSchema, insertEmailSchema, insertPhoneSchema, insertFieldDefinitionSchema, insertJobSchema, insertJobApplicationSchema, insertInterviewSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

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

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6),
});

const getFieldDefinitionsQuerySchema = z.object({
  entityType: z.string().optional(),
});

const getJobsQuerySchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  employmentType: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  priority: z.string().optional(),
  isRemote: z.coerce.boolean().optional(),
  sort: z.string().default("updatedAt:desc"),
  limit: z.coerce.number().min(1).max(100).default(25),
  cursor: z.string().optional(),
  includeDeleted: z.coerce.boolean().default(false),
});

const getAnalyticsQuerySchema = z.object({
  range: z.string().default("30d"),
  metrics: z.string().optional(),
  groupBy: z.string().optional(),
});

const getReportsQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  sort: z.string().default("updatedAt:desc"),
  limit: z.coerce.number().min(1).max(100).default(25),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // AUTH ROUTES
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        data: userWithoutPassword,
        message: "Login successful" 
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid login data" : "Login failed",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ 
        data: userWithoutPassword,
        message: "User created successfully" 
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid registration data" : "Registration failed",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    res.status(401).json({ message: "Not implemented - requires session management" });
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
  });

  // COMPANY ROUTES
  app.get("/api/companies", async (req: Request, res: Response) => {
    try {
      const params = getCompaniesQuerySchema.parse(req.query);
      const result = await storage.getCompanies(params);
      
      const nextCursor = result.hasNext && result.companies.length > 0 
        ? result.companies[result.companies.length - 1].updatedAt.toISOString()
        : null;

      res.json({
        data: result.companies,
        meta: {
          count: result.companies.length,
          total: result.total,
          hasNext: result.hasNext,
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

  app.get("/api/companies/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { include } = req.query;
      
      const includeRelated = include ? include.toString().split(",").some(i => ["addresses", "emails", "phones", "contacts"].includes(i)) : false;
      const company = await storage.getCompany(id, includeRelated);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      let responseData: any = company;

      if (include) {
        const includeFields = include.toString().split(",");
        const related: any = {};

        if (includeFields.includes("addresses")) {
          related.addresses = await storage.getAddresses("company", id);
        }
        if (includeFields.includes("emails")) {
          related.emails = await storage.getEmails("company", id);
        }
        if (includeFields.includes("phones")) {
          related.phones = await storage.getPhones("company", id);
        }
        if (includeFields.includes("contacts")) {
          const contactsResult = await storage.getContacts({ companyId: id, limit: 100 });
          related.contacts = contactsResult.contacts;
        }

        responseData = { ...company, ...related };
      }

      res.json({ data: responseData });
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post("/api/companies", async (req: Request, res: Response) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      
      res.status(201).json({ data: company });
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid company data" : "Failed to create company",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.patch("/api/companies/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = insertCompanySchema.partial().parse(req.body);
      
      const company = await storage.updateCompany(id, updateData);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json({ data: company });
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid company data" : "Failed to update company",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.delete("/api/companies/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCompany(id);
      
      if (!success) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  app.post("/api/companies/:id/addresses", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const addressData = insertAddressSchema.parse({
        ...req.body,
        entityType: "company",
        entityId: id,
      });
      
      const address = await storage.createAddress(addressData);
      res.status(201).json({ data: address });
    } catch (error) {
      console.error("Error creating address:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid address data" : "Failed to create address",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.post("/api/companies/:id/emails", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const emailData = insertEmailSchema.parse({
        ...req.body,
        entityType: "company",
        entityId: id,
      });
      
      const email = await storage.createEmail(emailData);
      res.status(201).json({ data: email });
    } catch (error) {
      console.error("Error creating email:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid email data" : "Failed to create email",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.post("/api/companies/:id/phones", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const phoneData = insertPhoneSchema.parse({
        ...req.body,
        entityType: "company",
        entityId: id,
      });
      
      const phone = await storage.createPhone(phoneData);
      res.status(201).json({ data: phone });
    } catch (error) {
      console.error("Error creating phone:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid phone data" : "Failed to create phone",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  // CONTACT ROUTES
  app.get("/api/contacts", async (req: Request, res: Response) => {
    try {
      const params = getContactsQuerySchema.parse(req.query);
      const result = await storage.getContacts(params);
      
      const nextCursor = result.hasNext && result.contacts.length > 0 
        ? result.contacts[result.contacts.length - 1].updatedAt.toISOString()
        : null;

      res.json({
        data: result.contacts,
        meta: {
          count: result.contacts.length,
          total: result.total,
          hasNext: result.hasNext,
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

  app.get("/api/contacts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { include } = req.query;
      
      const includeRelated = include ? include.toString().split(",").some(i => ["addresses", "emails", "phones", "company"].includes(i)) : false;
      const contact = await storage.getContact(id, includeRelated);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      let responseData: any = contact;

      if (include) {
        const includeFields = include.toString().split(",");
        const related: any = {};

        if (includeFields.includes("addresses")) {
          related.addresses = await storage.getAddresses("contact", id);
        }
        if (includeFields.includes("emails")) {
          related.emails = await storage.getEmails("contact", id);
        }
        if (includeFields.includes("phones")) {
          related.phones = await storage.getPhones("contact", id);
        }
        if (includeFields.includes("company") && contact.companyId) {
          related.company = await storage.getCompany(contact.companyId);
        }

        responseData = { ...contact, ...related };
      }

      res.json({ data: responseData });
    } catch (error) {
      console.error("Error fetching contact:", error);
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  app.post("/api/contacts", async (req: Request, res: Response) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      
      res.status(201).json({ data: contact });
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid contact data" : "Failed to create contact",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.patch("/api/contacts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = insertContactSchema.partial().parse(req.body);
      
      const contact = await storage.updateContact(id, updateData);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      res.json({ data: contact });
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid contact data" : "Failed to update contact",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.delete("/api/contacts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteContact(id);
      
      if (!success) {
        return res.status(404).json({ message: "Contact not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contact:", error);
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  app.post("/api/contacts/:id/addresses", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const addressData = insertAddressSchema.parse({
        ...req.body,
        entityType: "contact",
        entityId: id,
      });
      
      const address = await storage.createAddress(addressData);
      res.status(201).json({ data: address });
    } catch (error) {
      console.error("Error creating address:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid address data" : "Failed to create address",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.post("/api/contacts/:id/emails", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const emailData = insertEmailSchema.parse({
        ...req.body,
        entityType: "contact",
        entityId: id,
      });
      
      const email = await storage.createEmail(emailData);
      res.status(201).json({ data: email });
    } catch (error) {
      console.error("Error creating email:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid email data" : "Failed to create email",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.post("/api/contacts/:id/phones", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const phoneData = insertPhoneSchema.parse({
        ...req.body,
        entityType: "contact",
        entityId: id,
      });
      
      const phone = await storage.createPhone(phoneData);
      res.status(201).json({ data: phone });
    } catch (error) {
      console.error("Error creating phone:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid phone data" : "Failed to create phone",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  // FIELD DEFINITION ROUTES
  app.get("/api/field-definitions", async (req: Request, res: Response) => {
    try {
      const { entityType } = getFieldDefinitionsQuerySchema.parse(req.query);
      const fieldDefinitions = await storage.getFieldDefinitions(entityType);
      
      res.json({ data: fieldDefinitions });
    } catch (error) {
      console.error("Error fetching field definitions:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid query parameters" : "Failed to fetch field definitions",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.post("/api/field-definitions", async (req: Request, res: Response) => {
    try {
      const fieldDefData = insertFieldDefinitionSchema.parse(req.body);
      const fieldDefinition = await storage.createFieldDefinition(fieldDefData);
      
      res.status(201).json({ data: fieldDefinition });
    } catch (error) {
      console.error("Error creating field definition:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid field definition data" : "Failed to create field definition",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.patch("/api/field-definitions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = insertFieldDefinitionSchema.partial().parse(req.body);
      
      const fieldDefinition = await storage.updateFieldDefinition(id, updateData);
      
      if (!fieldDefinition) {
        return res.status(404).json({ message: "Field definition not found" });
      }

      res.json({ data: fieldDefinition });
    } catch (error) {
      console.error("Error updating field definition:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid field definition data" : "Failed to update field definition",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.delete("/api/field-definitions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteFieldDefinition(id);
      
      if (!success) {
        return res.status(404).json({ message: "Field definition not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting field definition:", error);
      res.status(500).json({ message: "Failed to delete field definition" });
    }
  });

  // JOBS ROUTES
  app.get("/api/jobs", async (req: Request, res: Response) => {
    try {
      const query = getJobsQuerySchema.parse(req.query);
      // Mock data for now - replace with actual storage calls
      const jobs: any[] = [];
      
      res.json({ 
        data: jobs,
        meta: {
          count: jobs.length,
          total: jobs.length,
          hasNext: false,
        }
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid query parameters" : "Failed to fetch jobs",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.post("/api/jobs", async (req: Request, res: Response) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      // Mock response for now - replace with actual storage call
      const job = { id: "job_1", ...jobData, createdAt: new Date(), updatedAt: new Date() };
      
      res.status(201).json({ data: job });
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid job data" : "Failed to create job",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  // ANALYTICS ROUTES
  app.get("/api/analytics", async (req: Request, res: Response) => {
    try {
      const query = getAnalyticsQuerySchema.parse(req.query);
      
      // Mock analytics data
      const analytics = {
        metrics: {
          totalJobs: 156,
          activeJobs: 89,
          totalApplications: 2847,
          hiredCandidates: 42,
          avgTimeToHire: 18,
          conversionRate: 0.128,
        },
        charts: {
          applicationsOverTime: [],
          hiringFunnel: [],
          sourceBreakdown: [],
          performanceMetrics: [],
        }
      };
      
      res.json({ data: analytics });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid query parameters" : "Failed to fetch analytics",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  // REPORTS ROUTES
  app.get("/api/reports", async (req: Request, res: Response) => {
    try {
      const query = getReportsQuerySchema.parse(req.query);
      
      // Mock reports data
      const reports: any[] = [];
      
      res.json({ 
        data: reports,
        meta: {
          count: reports.length,
          total: reports.length,
          hasNext: false,
        }
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid query parameters" : "Failed to fetch reports",
        errors: error instanceof z.ZodError ? error.errors : undefined,
      });
    }
  });

  app.post("/api/reports", async (req: Request, res: Response) => {
    try {
      // Mock report creation for now
      const reportData = req.body;
      const report = { 
        id: "report_1", 
        ...reportData, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      res.status(201).json({ data: report });
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(400).json({ 
        message: "Failed to create report"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
