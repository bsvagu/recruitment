import { 
  users, companies, contacts, addresses, emails, phones, fieldDefinitions,
  type User, type InsertUser, type Company, type InsertCompany, 
  type Contact, type InsertContact, type Address, type InsertAddress,
  type Email, type InsertEmail, type Phone, type InsertPhone,
  type FieldDefinition, type InsertFieldDefinition
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, ilike, desc, asc, isNull, sql, count } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Company methods
  getCompany(id: string, includeRelated?: boolean): Promise<Company | undefined>;
  getCompanies(params: GetCompaniesParams): Promise<{ companies: Company[]; hasNext: boolean; total: number }>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<boolean>;

  // Contact methods
  getContact(id: string, includeRelated?: boolean): Promise<Contact | undefined>;
  getContacts(params: GetContactsParams): Promise<{ contacts: Contact[]; hasNext: boolean; total: number }>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;

  // Address methods
  getAddresses(entityType: string, entityId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<boolean>;

  // Email methods
  getEmails(entityType: string, entityId: string): Promise<Email[]>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmail(id: string, email: Partial<InsertEmail>): Promise<Email | undefined>;
  deleteEmail(id: string): Promise<boolean>;

  // Phone methods
  getPhones(entityType: string, entityId: string): Promise<Phone[]>;
  createPhone(phone: InsertPhone): Promise<Phone>;
  updatePhone(id: string, phone: Partial<InsertPhone>): Promise<Phone | undefined>;
  deletePhone(id: string): Promise<boolean>;

  // Field definition methods
  getFieldDefinitions(entityType?: string): Promise<FieldDefinition[]>;
  createFieldDefinition(fieldDef: InsertFieldDefinition): Promise<FieldDefinition>;
  updateFieldDefinition(id: string, fieldDef: Partial<InsertFieldDefinition>): Promise<FieldDefinition | undefined>;
  deleteFieldDefinition(id: string): Promise<boolean>;
}

export interface GetCompaniesParams {
  q?: string;
  industry?: string;
  companyType?: string;
  employeeCountRange?: string;
  recordStatus?: string;
  country?: string;
  sort?: string;
  limit?: number;
  cursor?: string;
  includeDeleted?: boolean;
}

export interface GetContactsParams {
  q?: string;
  companyId?: string;
  seniority?: string;
  lifecycleStage?: string;
  recordStatus?: string;
  country?: string;
  sort?: string;
  limit?: number;
  cursor?: string;
  includeDeleted?: boolean;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updateUser, updatedAt: sql`now()` })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getCompany(id: string, includeRelated = false): Promise<Company | undefined> {
    if (includeRelated) {
      const result = await db.query.companies.findFirst({
        where: eq(companies.id, id),
        with: {
          addresses: true,
          emails: true,
          phones: true,
          contacts: true,
        },
      });
      return result || undefined;
    }

    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanies(params: GetCompaniesParams): Promise<{ companies: Company[]; hasNext: boolean; total: number }> {
    const {
      q,
      industry,
      companyType,
      employeeCountRange,
      recordStatus,
      country,
      sort = "updatedAt:desc",
      limit = 25,
      cursor,
      includeDeleted = false,
    } = params;

    let query = db.select().from(companies);
    const conditions = [];

    // Base condition - exclude deleted unless specified
    if (!includeDeleted) {
      conditions.push(eq(companies.isDeleted, false));
    }

    // Search query
    if (q) {
      conditions.push(
        or(
          ilike(companies.name, `%${q}%`),
          ilike(companies.legalName, `%${q}%`),
          sql`${companies.emailDomains} @> ARRAY[${q}]`,
          ilike(companies.description, `%${q}%`)
        )
      );
    }

    // Filters
    if (industry) conditions.push(eq(companies.industry, industry as any));
    if (companyType) conditions.push(eq(companies.companyType, companyType as any));
    if (employeeCountRange) conditions.push(eq(companies.employeeCountRange, employeeCountRange as any));
    if (recordStatus) conditions.push(eq(companies.recordStatus, recordStatus as any));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Country filter (requires join with addresses)
    if (country) {
      query = query
        .leftJoin(addresses, and(
          eq(addresses.entityType, "company"),
          eq(addresses.entityId, companies.id)
        ))
        .where(and(
          ...conditions,
          eq(addresses.countryCode, country)
        ));
    }

    // Cursor pagination
    if (cursor) {
      conditions.push(sql`${companies.updatedAt} < ${cursor}`);
    }

    // Sorting
    const [sortField, sortOrder] = sort.split(":");
    const orderBy = sortOrder === "desc" ? desc : asc;

    switch (sortField) {
      case "name":
        query = query.orderBy(orderBy(companies.name));
        break;
      case "createdAt":
        query = query.orderBy(orderBy(companies.createdAt));
        break;
      default:
        query = query.orderBy(orderBy(companies.updatedAt));
    }

    // Apply limit + 1 to check for next page
    query = query.limit(limit + 1);

    const results = await query;
    const hasNext = results.length > limit;
    const companyResults = hasNext ? results.slice(0, -1) : results;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(companies)
      .where(includeDeleted ? undefined : eq(companies.isDeleted, false));

    return {
      companies: companyResults.map(r => 'companies' in r ? r.companies : r),
      hasNext,
      total: totalResult.count,
    };
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: string, updateCompany: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set({ ...updateCompany, updatedAt: sql`now()` })
      .where(eq(companies.id, id))
      .returning();
    return company || undefined;
  }

  async deleteCompany(id: string): Promise<boolean> {
    const [result] = await db
      .update(companies)
      .set({ isDeleted: true, updatedAt: sql`now()` })
      .where(eq(companies.id, id))
      .returning();
    return !!result;
  }

  async getContact(id: string, includeRelated = false): Promise<Contact | undefined> {
    if (includeRelated) {
      const result = await db.query.contacts.findFirst({
        where: eq(contacts.id, id),
        with: {
          company: true,
          addresses: true,
          emails: true,
          phones: true,
        },
      });
      return result || undefined;
    }

    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async getContacts(params: GetContactsParams): Promise<{ contacts: Contact[]; hasNext: boolean; total: number }> {
    const {
      q,
      companyId,
      seniority,
      lifecycleStage,
      recordStatus,
      country,
      sort = "updatedAt:desc",
      limit = 25,
      cursor,
      includeDeleted = false,
    } = params;

    let query = db.select().from(contacts);
    const conditions = [];

    // Base condition - exclude deleted unless specified
    if (!includeDeleted) {
      conditions.push(eq(contacts.isDeleted, false));
    }

    // Search query
    if (q) {
      conditions.push(
        or(
          ilike(contacts.firstName, `%${q}%`),
          ilike(contacts.lastName, `%${q}%`),
          ilike(contacts.title, `%${q}%`),
          ilike(contacts.headline, `%${q}%`),
          ilike(contacts.companyNameSnapshot, `%${q}%`)
        )
      );
    }

    // Filters
    if (companyId) conditions.push(eq(contacts.companyId, companyId));
    if (seniority) conditions.push(eq(contacts.seniority, seniority as any));
    if (lifecycleStage) conditions.push(eq(contacts.lifecycleStage, lifecycleStage as any));
    if (recordStatus) conditions.push(eq(contacts.recordStatus, recordStatus as any));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Country filter (requires join with addresses)
    if (country) {
      query = query
        .leftJoin(addresses, and(
          eq(addresses.entityType, "contact"),
          eq(addresses.entityId, contacts.id)
        ))
        .where(and(
          ...conditions,
          eq(addresses.countryCode, country)
        ));
    }

    // Cursor pagination
    if (cursor) {
      conditions.push(sql`${contacts.updatedAt} < ${cursor}`);
    }

    // Sorting
    const [sortField, sortOrder] = sort.split(":");
    const orderBy = sortOrder === "desc" ? desc : asc;

    switch (sortField) {
      case "lastName":
        query = query.orderBy(orderBy(contacts.lastName));
        break;
      case "firstName":
        query = query.orderBy(orderBy(contacts.firstName));
        break;
      case "createdAt":
        query = query.orderBy(orderBy(contacts.createdAt));
        break;
      default:
        query = query.orderBy(orderBy(contacts.updatedAt));
    }

    // Apply limit + 1 to check for next page
    query = query.limit(limit + 1);

    const results = await query;
    const hasNext = results.length > limit;
    const contactResults = hasNext ? results.slice(0, -1) : results;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(contacts)
      .where(includeDeleted ? undefined : eq(contacts.isDeleted, false));

    return {
      contacts: contactResults.map(r => 'contacts' in r ? r.contacts : r),
      hasNext,
      total: totalResult.count,
    };
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async updateContact(id: string, updateContact: Partial<InsertContact>): Promise<Contact | undefined> {
    const [contact] = await db
      .update(contacts)
      .set({ ...updateContact, updatedAt: sql`now()` })
      .where(eq(contacts.id, id))
      .returning();
    return contact || undefined;
  }

  async deleteContact(id: string): Promise<boolean> {
    const [result] = await db
      .update(contacts)
      .set({ isDeleted: true, updatedAt: sql`now()` })
      .where(eq(contacts.id, id))
      .returning();
    return !!result;
  }

  async getAddresses(entityType: string, entityId: string): Promise<Address[]> {
    return await db
      .select()
      .from(addresses)
      .where(and(
        eq(addresses.entityType, entityType),
        eq(addresses.entityId, entityId)
      ))
      .orderBy(desc(addresses.isPrimary), addresses.createdAt);
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const [address] = await db.insert(addresses).values(insertAddress).returning();
    return address;
  }

  async updateAddress(id: string, updateAddress: Partial<InsertAddress>): Promise<Address | undefined> {
    const [address] = await db
      .update(addresses)
      .set({ ...updateAddress, updatedAt: sql`now()` })
      .where(eq(addresses.id, id))
      .returning();
    return address || undefined;
  }

  async deleteAddress(id: string): Promise<boolean> {
    const [result] = await db.delete(addresses).where(eq(addresses.id, id)).returning();
    return !!result;
  }

  async getEmails(entityType: string, entityId: string): Promise<Email[]> {
    return await db
      .select()
      .from(emails)
      .where(and(
        eq(emails.entityType, entityType),
        eq(emails.entityId, entityId)
      ))
      .orderBy(desc(emails.isPrimary), emails.createdAt);
  }

  async createEmail(insertEmail: InsertEmail): Promise<Email> {
    const [email] = await db.insert(emails).values(insertEmail).returning();
    return email;
  }

  async updateEmail(id: string, updateEmail: Partial<InsertEmail>): Promise<Email | undefined> {
    const [email] = await db
      .update(emails)
      .set({ ...updateEmail, updatedAt: sql`now()` })
      .where(eq(emails.id, id))
      .returning();
    return email || undefined;
  }

  async deleteEmail(id: string): Promise<boolean> {
    const [result] = await db.delete(emails).where(eq(emails.id, id)).returning();
    return !!result;
  }

  async getPhones(entityType: string, entityId: string): Promise<Phone[]> {
    return await db
      .select()
      .from(phones)
      .where(and(
        eq(phones.entityType, entityType),
        eq(phones.entityId, entityId)
      ))
      .orderBy(desc(phones.isPrimary), phones.createdAt);
  }

  async createPhone(insertPhone: InsertPhone): Promise<Phone> {
    const [phone] = await db.insert(phones).values(insertPhone).returning();
    return phone;
  }

  async updatePhone(id: string, updatePhone: Partial<InsertPhone>): Promise<Phone | undefined> {
    const [phone] = await db
      .update(phones)
      .set({ ...updatePhone, updatedAt: sql`now()` })
      .where(eq(phones.id, id))
      .returning();
    return phone || undefined;
  }

  async deletePhone(id: string): Promise<boolean> {
    const [result] = await db.delete(phones).where(eq(phones.id, id)).returning();
    return !!result;
  }

  async getFieldDefinitions(entityType?: string): Promise<FieldDefinition[]> {
    const conditions = [eq(fieldDefinitions.isActive, true)];
    if (entityType) {
      conditions.push(eq(fieldDefinitions.entityType, entityType));
    }

    return await db
      .select()
      .from(fieldDefinitions)
      .where(and(...conditions))
      .orderBy(fieldDefinitions.label);
  }

  async createFieldDefinition(insertFieldDef: InsertFieldDefinition): Promise<FieldDefinition> {
    const [fieldDef] = await db.insert(fieldDefinitions).values(insertFieldDef).returning();
    return fieldDef;
  }

  async updateFieldDefinition(id: string, updateFieldDef: Partial<InsertFieldDefinition>): Promise<FieldDefinition | undefined> {
    const [fieldDef] = await db
      .update(fieldDefinitions)
      .set({ ...updateFieldDef, updatedAt: sql`now()` })
      .where(eq(fieldDefinitions.id, id))
      .returning();
    return fieldDef || undefined;
  }

  async deleteFieldDefinition(id: string): Promise<boolean> {
    const [result] = await db
      .update(fieldDefinitions)
      .set({ isActive: false, updatedAt: sql`now()` })
      .where(eq(fieldDefinitions.id, id))
      .returning();
    return !!result;
  }
}

export const storage = new DatabaseStorage();
