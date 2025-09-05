import { apiRequest } from "./queryClient";
import type { 
  Company, 
  Contact, 
  InsertCompany, 
  InsertContact,
  Address,
  Email,
  Phone,
  InsertAddress,
  InsertEmail,
  InsertPhone,
  CompanySearchParams,
  ContactSearchParams,
  ApiResponse 
} from "./types";

export const apiClient = {
  // Company endpoints
  companies: {
    list: (params: CompanySearchParams = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
      const queryString = searchParams.toString();
      return `/api/companies${queryString ? `?${queryString}` : ''}`;
    },
    
    get: (id: string, include?: string) => {
      const params = include ? `?include=${include}` : '';
      return `/api/companies/${id}${params}`;
    },
    
    create: async (data: InsertCompany): Promise<Company> => {
      const response = await apiRequest("POST", "/api/companies", data);
      const result = await response.json();
      return result.data;
    },
    
    update: async (id: string, data: Partial<InsertCompany>): Promise<Company> => {
      const response = await apiRequest("PATCH", `/api/companies/${id}`, data);
      const result = await response.json();
      return result.data;
    },
    
    delete: async (id: string): Promise<void> => {
      await apiRequest("DELETE", `/api/companies/${id}`);
    },
    
    addAddress: async (id: string, data: Omit<InsertAddress, 'entityType' | 'entityId'>): Promise<Address> => {
      const response = await apiRequest("POST", `/api/companies/${id}/addresses`, data);
      const result = await response.json();
      return result.data;
    },
    
    addEmail: async (id: string, data: Omit<InsertEmail, 'entityType' | 'entityId'>): Promise<Email> => {
      const response = await apiRequest("POST", `/api/companies/${id}/emails`, data);
      const result = await response.json();
      return result.data;
    },
    
    addPhone: async (id: string, data: Omit<InsertPhone, 'entityType' | 'entityId'>): Promise<Phone> => {
      const response = await apiRequest("POST", `/api/companies/${id}/phones`, data);
      const result = await response.json();
      return result.data;
    },
  },
  
  // Contact endpoints
  contacts: {
    list: (params: ContactSearchParams = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
      const queryString = searchParams.toString();
      return `/api/contacts${queryString ? `?${queryString}` : ''}`;
    },
    
    get: (id: string, include?: string) => {
      const params = include ? `?include=${include}` : '';
      return `/api/contacts/${id}${params}`;
    },
    
    create: async (data: InsertContact): Promise<Contact> => {
      const response = await apiRequest("POST", "/api/contacts", data);
      const result = await response.json();
      return result.data;
    },
    
    update: async (id: string, data: Partial<InsertContact>): Promise<Contact> => {
      const response = await apiRequest("PATCH", `/api/contacts/${id}`, data);
      const result = await response.json();
      return result.data;
    },
    
    delete: async (id: string): Promise<void> => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    
    addAddress: async (id: string, data: Omit<InsertAddress, 'entityType' | 'entityId'>): Promise<Address> => {
      const response = await apiRequest("POST", `/api/contacts/${id}/addresses`, data);
      const result = await response.json();
      return result.data;
    },
    
    addEmail: async (id: string, data: Omit<InsertEmail, 'entityType' | 'entityId'>): Promise<Email> => {
      const response = await apiRequest("POST", `/api/contacts/${id}/emails`, data);
      const result = await response.json();
      return result.data;
    },
    
    addPhone: async (id: string, data: Omit<InsertPhone, 'entityType' | 'entityId'>): Promise<Phone> => {
      const response = await apiRequest("POST", `/api/contacts/${id}/phones`, data);
      const result = await response.json();
      return result.data;
    },
  },
  
  // Field definitions
  fieldDefinitions: {
    list: (entityType?: string) => {
      const params = entityType ? `?entityType=${entityType}` : '';
      return `/api/field-definitions${params}`;
    },
  },
};
