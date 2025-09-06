import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import type { Request, Response } from "express";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['admin', 'manager', 'recruiter', 'viewer']).default('viewer'),
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({
      where: { email },
    });

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

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const userData = registerSchema.parse(req.body);
    
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: userData.username },
    });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
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

// GET /api/auth/me
router.get("/me", async (req: Request, res: Response) => {
  res.status(401).json({ message: "Not implemented - requires session management" });
});

// POST /api/auth/logout
router.post("/logout", async (req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

export default router;