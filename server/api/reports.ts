import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import type { Request, Response } from "express";

const router = Router();

const getReportsQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  sort: z.string().default("updatedAt:desc"),
  limit: z.coerce.number().min(1).max(100).default(25),
});

const createReportSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string(),
  category: z.string().optional(),
  dataSource: z.string(),
  filters: z.record(z.any()).optional(),
  groupBy: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional(),
  chartType: z.string().optional(),
  refreshInterval: z.number().default(3600),
  isPublic: z.boolean().default(false),
});

// GET /api/reports
router.get("/", async (req: Request, res: Response) => {
  try {
    const query = getReportsQuerySchema.parse(req.query);
    
    // Mock reports data for now
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

// POST /api/reports
router.post("/", async (req: Request, res: Response) => {
  try {
    const reportData = createReportSchema.parse(req.body);
    
    // Mock report creation for now
    const report = { 
      id: "report_" + Date.now(), 
      ...reportData, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    
    res.status(201).json({ data: report });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid report data" : "Failed to create report",
      errors: error instanceof z.ZodError ? error.errors : undefined,
    });
  }
});

export default router;