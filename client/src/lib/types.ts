// Re-export types from Prisma for frontend use
export type {
  User,
  Company,
  Contact,
  Address,
  Email,
  Phone,
  FieldDefinition,
  CompanyType,
  EmployeeCountRange,
  Industry,
  LifecycleStage,
  RecordStatus,
  AddressType,
  EmailType,
  PhoneType,
  Seniority,
  Role,
  FieldType,
  ApiResponse,
  SearchParams,
  CompanySearchParams,
  ContactSearchParams,
} from "@shared/schema";


export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface FormFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multi_select' | 'email' | 'url' | 'phone';
  options?: string[];
  isRequired?: boolean;
}

// Insert types for forms
export interface InsertCompany {
  name: string;
  legalName?: string;
  emailDomains?: string[];
  companyType?: CompanyType;
  employeeCountRange?: EmployeeCountRange;
  industry?: Industry;
  specialties?: string[];
  foundedYear?: number;
  description?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;
  lifecycleStage?: LifecycleStage;
  recordStatus?: RecordStatus;
  ownerId?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface InsertContact {
  prefix?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  preferredName?: string;
  pronouns?: string;
  headline?: string;
  title?: string;
  department?: string;
  seniority?: Seniority;
  companyId?: string;
  companyNameSnapshot?: string;
  linkedinUrl?: string;
  locationLabel?: string;
  timeZone?: string;
  employmentStartDate?: Date;
  employmentEndDate?: Date;
  isCurrentEmployee?: boolean;
  employmentHistory?: any[];
  lifecycleStage?: LifecycleStage;
  recordStatus?: RecordStatus;
  ownerId?: string;
  tags?: string[];
  notes?: string;
  customFields?: Record<string, any>;
}

export interface InsertAddress {
  entityType: string;
  entityId: string;
  type?: AddressType;
  label?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  latitude?: string;
  longitude?: string;
  isPrimary?: boolean;
}

export interface InsertEmail {
  entityType: string;
  entityId: string;
  type?: EmailType;
  email: string;
  isPrimary?: boolean;
  isVerified?: boolean;
}

export interface InsertPhone {
  entityType: string;
  entityId: string;
  type?: PhoneType;
  phone: string;
  isPrimary?: boolean;
  isVerified?: boolean;
}

// Mock types for features not yet implemented
export interface Job {
  id: string;
  title: string;
  description?: string;
  companyId?: string;
  department?: string;
  location?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  status: string;
  priority: string;
  openings: number;
  isRemote: boolean;
  createdAt: Date;
  updatedAt: Date;
}