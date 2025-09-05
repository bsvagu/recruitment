import { sql } from "drizzle-orm";
import { pgTable, varchar, text, timestamp, boolean, jsonb, integer, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const companyTypeEnum = pgEnum('company_type', [
  'public', 'private', 'nonprofit', 'government', 'partnership', 'sole_proprietorship'
]);

export const employeeCountRangeEnum = pgEnum('employee_count_range', [
  '1', '2-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10001+'
]);

export const industryEnum = pgEnum('industry', [
  'technology', 'finance', 'healthcare', 'retail', 'manufacturing', 'consulting',
  'education', 'real_estate', 'transportation', 'energy', 'media', 'hospitality'
]);

export const lifecycleStageEnum = pgEnum('lifecycle_stage', [
  'subscriber', 'lead', 'marketing_qualified_lead', 'sales_qualified_lead',
  'opportunity', 'customer', 'evangelist', 'other'
]);

export const recordStatusEnum = pgEnum('record_status', [
  'active', 'inactive', 'archived'
]);

export const addressTypeEnum = pgEnum('address_type', [
  'hq', 'billing', 'shipping', 'office', 'remote', 'home', 'other'
]);

export const emailTypeEnum = pgEnum('email_type', [
  'work', 'personal', 'sales', 'support', 'billing', 'other'
]);

export const phoneTypeEnum = pgEnum('phone_type', [
  'work', 'personal', 'mobile', 'fax', 'other'
]);

export const seniorityEnum = pgEnum('seniority', [
  'intern', 'entry', 'mid', 'senior', 'lead', 'principal', 'manager', 'director', 'vp', 'c_level', 'owner'
]);

export const roleEnum = pgEnum('role', [
  'admin', 'manager', 'recruiter', 'viewer'
]);

export const fieldTypeEnum = pgEnum('field_type', [
  'text', 'number', 'boolean', 'date', 'select', 'multi_select', 'email', 'url', 'phone'
]);

export const employmentTypeEnum = pgEnum('employment_type', [
  'full_time', 'part_time', 'contract', 'freelance', 'internship', 'temporary'
]);

export const experienceLevelEnum = pgEnum('experience_level', [
  'entry', 'mid', 'senior', 'lead', 'principal', 'executive'
]);

export const jobStatusEnum = pgEnum('job_status', [
  'draft', 'active', 'paused', 'closed', 'cancelled'
]);

export const applicationStatusEnum = pgEnum('application_status', [
  'applied', 'screening', 'interview', 'assessment', 'reference_check', 'offer', 'hired', 'rejected', 'withdrawn'
]);

export const interviewStatusEnum = pgEnum('interview_status', [
  'scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'
]);

export const priorityEnum = pgEnum('priority', [
  'low', 'medium', 'high', 'urgent'
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: roleEnum("role").notNull().default("viewer"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Field definitions for custom fields
export const fieldDefinitions = pgTable("field_definitions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // 'company' or 'contact'
  key: text("key").notNull(),
  label: text("label").notNull(),
  type: fieldTypeEnum("type").notNull(),
  options: jsonb("options"), // For select/multi-select fields
  isRequired: boolean("is_required").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Companies table
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  legalName: text("legal_name"),
  emailDomains: text("email_domains").array(),
  companyType: companyTypeEnum("company_type"),
  employeeCountRange: employeeCountRangeEnum("employee_count_range"),
  industry: industryEnum("industry"),
  specialties: text("specialties").array(),
  foundedYear: integer("founded_year"),
  description: text("description"),
  websiteUrl: text("website_url"),
  linkedinUrl: text("linkedin_url"),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  lifecycleStage: lifecycleStageEnum("lifecycle_stage").default("lead"),
  recordStatus: recordStatusEnum("record_status").notNull().default("active"),
  ownerId: uuid("owner_id").references(() => users.id),
  tags: text("tags").array(),
  customFields: jsonb("custom_fields"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Contacts table
export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  prefix: text("prefix"),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  suffix: text("suffix"),
  preferredName: text("preferred_name"),
  pronouns: text("pronouns"),
  headline: text("headline"),
  title: text("title"),
  department: text("department"),
  seniority: seniorityEnum("seniority"),
  companyId: uuid("company_id").references(() => companies.id),
  companyNameSnapshot: text("company_name_snapshot"),
  linkedinUrl: text("linkedin_url"),
  locationLabel: text("location_label"),
  timeZone: text("time_zone"),
  employmentStartDate: timestamp("employment_start_date"),
  employmentEndDate: timestamp("employment_end_date"),
  isCurrentEmployee: boolean("is_current_employee").notNull().default(true),
  employmentHistory: jsonb("employment_history"),
  lifecycleStage: lifecycleStageEnum("lifecycle_stage").default("lead"),
  recordStatus: recordStatusEnum("record_status").notNull().default("active"),
  ownerId: uuid("owner_id").references(() => users.id),
  tags: text("tags").array(),
  notes: text("notes"),
  customFields: jsonb("custom_fields"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Addresses table
export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // 'company' or 'contact'
  entityId: uuid("entity_id").notNull(),
  type: addressTypeEnum("type").notNull().default("other"),
  label: text("label"),
  street1: text("street1"),
  street2: text("street2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  countryCode: text("country_code"), // ISO 3166-1 alpha-2
  latitude: text("latitude"),
  longitude: text("longitude"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Emails table
export const emails = pgTable("emails", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // 'company' or 'contact'
  entityId: uuid("entity_id").notNull(),
  type: emailTypeEnum("type").notNull().default("other"),
  email: text("email").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Phones table
export const phones = pgTable("phones", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // 'company' or 'contact'
  entityId: uuid("entity_id").notNull(),
  type: phoneTypeEnum("type").notNull().default("other"),
  phone: text("phone").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Jobs/Positions Management
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  companyId: uuid("company_id").references(() => companies.id),
  department: text("department"),
  location: text("location"),
  employmentType: employmentTypeEnum("employment_type").default("full_time"),
  experienceLevel: experienceLevelEnum("experience_level").default("mid"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryCurrency: text("salary_currency").default("USD"),
  requirements: jsonb("requirements"),
  responsibilities: jsonb("responsibilities"),
  benefits: jsonb("benefits"),
  skills: text("skills").array(),
  status: jobStatusEnum("status").default("draft"),
  priority: priorityEnum("priority").default("medium"),
  openings: integer("openings").default(1),
  applicationDeadline: timestamp("application_deadline"),
  hiringManagerId: uuid("hiring_manager_id").references(() => users.id),
  createdBy: uuid("created_by").references(() => users.id),
  publishedAt: timestamp("published_at"),
  isRemote: boolean("is_remote").default(false),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Job Applications
export const jobApplications = pgTable("job_applications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: uuid("job_id").references(() => jobs.id).notNull(),
  contactId: uuid("contact_id").references(() => contacts.id).notNull(),
  status: applicationStatusEnum("status").default("applied"),
  stage: text("stage"),
  source: text("source"),
  coverLetter: text("cover_letter"),
  resumeUrl: text("resume_url"),
  portfolioUrl: text("portfolio_url"),
  expectedSalary: integer("expected_salary"),
  availabilityDate: timestamp("availability_date"),
  notes: text("notes"),
  rating: integer("rating"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  appliedAt: timestamp("applied_at").default(sql`now()`),
  lastUpdated: timestamp("last_updated").default(sql`now()`),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Interview Schedules
export const interviews = pgTable("interviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: uuid("application_id").references(() => jobApplications.id).notNull(),
  interviewerIds: text("interviewer_ids").array(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(60),
  type: text("type").default("video"),
  location: text("location"),
  status: interviewStatusEnum("status").default("scheduled"),
  notes: text("notes"),
  feedback: text("feedback"),
  rating: integer("rating"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Analytics Events for tracking
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  userId: uuid("user_id").references(() => users.id),
  sessionId: text("session_id"),
  properties: jsonb("properties"),
  timestamp: timestamp("timestamp").default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Reports Configuration
export const reportConfigurations = pgTable("report_configurations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  category: text("category"),
  dataSource: text("data_source").notNull(),
  filters: jsonb("filters"),
  groupBy: jsonb("group_by"),
  metrics: jsonb("metrics"),
  chartType: text("chart_type"),
  refreshInterval: integer("refresh_interval").default(3600),
  isPublic: boolean("is_public").default(false),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Saved Dashboards
export const dashboards = pgTable("dashboards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  layout: jsonb("layout"),
  widgets: jsonb("widgets"),
  isDefault: boolean("is_default").default(false),
  isPublic: boolean("is_public").default(false),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedCompanies: many(companies, { relationName: "owner" }),
  ownedContacts: many(contacts, { relationName: "owner" }),
  createdJobs: many(jobs, { relationName: "creator" }),
  managingJobs: many(jobs, { relationName: "hiringManager" }),
  assignedApplications: many(jobApplications, { relationName: "assignee" }),
  conductedInterviews: many(interviews, { relationName: "creator" }),
  createdReports: many(reportConfigurations, { relationName: "creator" }),
  createdDashboards: many(dashboards, { relationName: "creator" }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  owner: one(users, {
    fields: [companies.ownerId],
    references: [users.id],
    relationName: "owner",
  }),
  contacts: many(contacts),
  addresses: many(addresses),
  emails: many(emails),
  phones: many(phones),
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  hiringManager: one(users, {
    fields: [jobs.hiringManagerId],
    references: [users.id],
    relationName: "hiringManager",
  }),
  creator: one(users, {
    fields: [jobs.createdBy],
    references: [users.id],
    relationName: "creator",
  }),
  applications: many(jobApplications),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one, many }) => ({
  job: one(jobs, {
    fields: [jobApplications.jobId],
    references: [jobs.id],
  }),
  contact: one(contacts, {
    fields: [jobApplications.contactId],
    references: [contacts.id],
  }),
  assignee: one(users, {
    fields: [jobApplications.assignedTo],
    references: [users.id],
    relationName: "assignee",
  }),
  interviews: many(interviews),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  application: one(jobApplications, {
    fields: [interviews.applicationId],
    references: [jobApplications.id],
  }),
  creator: one(users, {
    fields: [interviews.createdBy],
    references: [users.id],
    relationName: "creator",
  }),
}));

export const reportConfigurationsRelations = relations(reportConfigurations, ({ one }) => ({
  creator: one(users, {
    fields: [reportConfigurations.createdBy],
    references: [users.id],
    relationName: "creator",
  }),
}));

export const dashboardsRelations = relations(dashboards, ({ one }) => ({
  creator: one(users, {
    fields: [dashboards.createdBy],
    references: [users.id],
    relationName: "creator",
  }),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  owner: one(users, {
    fields: [contacts.ownerId],
    references: [users.id],
    relationName: "owner",
  }),
  addresses: many(addresses),
  emails: many(emails),
  phones: many(phones),
  applications: many(jobApplications),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  company: one(companies, {
    fields: [addresses.entityId],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [addresses.entityId],
    references: [contacts.id],
  }),
}));

export const emailsRelations = relations(emails, ({ one }) => ({
  company: one(companies, {
    fields: [emails.entityId],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [emails.entityId],
    references: [contacts.id],
  }),
}));

export const phonesRelations = relations(phones, ({ one }) => ({
  company: one(companies, {
    fields: [phones.entityId],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [phones.entityId],
    references: [contacts.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPhoneSchema = createInsertSchema(phones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFieldDefinitionSchema = createInsertSchema(fieldDefinitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  appliedAt: true,
  lastUpdated: true,
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  timestamp: true,
  createdAt: true,
});

export const insertReportConfigurationSchema = createInsertSchema(reportConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Phone = typeof phones.$inferSelect;
export type InsertPhone = z.infer<typeof insertPhoneSchema>;
export type FieldDefinition = typeof fieldDefinitions.$inferSelect;
export type InsertFieldDefinition = z.infer<typeof insertFieldDefinitionSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type ReportConfiguration = typeof reportConfigurations.$inferSelect;
export type InsertReportConfiguration = z.infer<typeof insertReportConfigurationSchema>;
export type Dashboard = typeof dashboards.$inferSelect;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
