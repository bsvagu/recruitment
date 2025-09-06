import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import type { Request, Response } from "express";

const router = Router();

const getAnalyticsQuerySchema = z.object({
  range: z.string().default("30d"),
  metrics: z.string().optional(),
  groupBy: z.string().optional(),
});

// GET /api/analytics
router.get("/", async (req: Request, res: Response) => {
  try {
    const query = getAnalyticsQuerySchema.parse(req.query);
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (query.range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get basic metrics
    const [
      totalCompanies,
      activeCompanies,
      totalContacts,
      activeContacts,
      recentCompanies,
      recentContacts,
    ] = await Promise.all([
      prisma.company.count({ where: { isDeleted: false } }),
      prisma.company.count({ where: { isDeleted: false, recordStatus: 'active' } }),
      prisma.contact.count({ where: { isDeleted: false } }),
      prisma.contact.count({ where: { isDeleted: false, recordStatus: 'active' } }),
      prisma.company.count({ 
        where: { 
          isDeleted: false, 
          createdAt: { gte: startDate } 
        } 
      }),
      prisma.contact.count({ 
        where: { 
          isDeleted: false, 
          createdAt: { gte: startDate } 
        } 
      }),
    ]);

    // Mock analytics data with real counts
    const analytics = {
      metrics: {
        totalCompanies,
        activeCompanies,
        totalContacts,
        activeContacts,
        recentCompanies,
        recentContacts,
        conversionRate: 0.128,
      },
      charts: {
        companiesOverTime: [],
        contactsOverTime: [],
        industryBreakdown: [],
        lifecycleStageBreakdown: [],
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

export default router;