// Prisma types re-export for frontend compatibility
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
} from "@prisma/client";

// Additional types for API responses
export interface ApiResponse<T> {
  data: T;
  meta?: {
    count: number;
    total: number;
    hasNext: boolean;
  };
  links?: {
    next: string | null;
  };
}

export interface SearchParams {
  q?: string;
  sort?: string;
  limit?: number;
  cursor?: string;
  includeDeleted?: boolean;
}

export interface CompanySearchParams extends SearchParams {
  industry?: string;
  companyType?: string;
  employeeCountRange?: string;
  recordStatus?: string;
  country?: string;
  include?: string;
}

export interface ContactSearchParams extends SearchParams {
  companyId?: string;
  seniority?: string;
  lifecycleStage?: string;
  recordStatus?: string;
  country?: string;
  include?: string;
}