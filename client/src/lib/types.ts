// Re-export types from shared schema for frontend use
export type {
  User,
  InsertUser,
  Company,
  InsertCompany,
  Contact,
  InsertContact,
  Address,
  InsertAddress,
  Email,
  InsertEmail,
  Phone,
  InsertPhone,
  FieldDefinition,
  InsertFieldDefinition,
} from "@shared/schema";

// Additional frontend-specific types
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
