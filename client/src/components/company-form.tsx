import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Building, Globe, MapPin, Phone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import TagInput from "./tag-input";
import EmailList from "./email-list";
import PhoneList from "./phone-list";
import AddressForm from "./address-form";
import { apiRequest } from "@/lib/queryClient";
import type { Company } from "@shared/schema";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  legalName: z.string().optional(),
  industry: z.enum(["technology", "finance", "healthcare", "retail", "manufacturing", "consulting", "education", "real_estate", "transportation", "energy", "media", "hospitality"]).optional(),
  companyType: z.enum(["public", "private", "nonprofit", "government", "partnership", "sole_proprietorship"]).optional(),
  employeeCountRange: z.enum(["1", "2-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10001+"]).optional(),
  foundedYear: z.coerce.number().min(1800).max(new Date().getFullYear()).optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  lifecycleStage: z.enum(["subscriber", "lead", "marketing_qualified_lead", "sales_qualified_lead", "opportunity", "customer", "evangelist", "other"]).optional(),
  recordStatus: z.enum(["active", "inactive", "archived"]).default("active"),
  emailDomains: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyFormProps {
  company?: Company;
  onSuccess?: () => void;
  className?: string;
}

export default function CompanyForm({ company, onSuccess, className }: CompanyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || "",
      legalName: company?.legalName || "",
      industry: company?.industry || "",
      companyType: company?.companyType || "",
      employeeCountRange: company?.employeeCountRange || "",
      foundedYear: company?.foundedYear || undefined,
      websiteUrl: company?.websiteUrl || "",
      linkedinUrl: company?.linkedinUrl || "",
      description: company?.description || "",
      lifecycleStage: company?.lifecycleStage || "lead",
      recordStatus: company?.recordStatus || "active",
      emailDomains: company?.emailDomains || [],
      specialties: company?.specialties || [],
      tags: company?.tags || [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      return apiRequest("/api/companies", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Success",
        description: "Company created successfully",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create company",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      return apiRequest(`/api/companies/${company!.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", company!.id] });
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update company",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...data,
        foundedYear: data.foundedYear || null,
        websiteUrl: data.websiteUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        description: data.description || null,
        emailDomains: data.emailDomains?.filter(domain => domain.trim()) || null,
        specialties: data.specialties?.filter(specialty => specialty.trim()) || null,
        tags: data.tags?.filter(tag => tag.trim()) || null,
      };

      if (company) {
        await updateMutation.mutateAsync(submitData);
      } else {
        await createMutation.mutateAsync(submitData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const industries = [
    { value: "technology", label: "Technology" },
    { value: "finance", label: "Finance" },
    { value: "healthcare", label: "Healthcare" },
    { value: "retail", label: "Retail" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "consulting", label: "Consulting" },
    { value: "education", label: "Education" },
    { value: "real_estate", label: "Real Estate" },
    { value: "transportation", label: "Transportation" },
    { value: "energy", label: "Energy" },
    { value: "media", label: "Media" },
    { value: "hospitality", label: "Hospitality" },
  ];

  const companyTypes = [
    { value: "public", label: "Public Company" },
    { value: "private", label: "Private Company" },
    { value: "nonprofit", label: "Non-profit" },
    { value: "government", label: "Government" },
    { value: "partnership", label: "Partnership" },
    { value: "sole_proprietorship", label: "Sole Proprietorship" },
  ];

  const employeeCounts = [
    { value: "1", label: "1 employee" },
    { value: "2-10", label: "2-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "501-1000", label: "501-1000 employees" },
    { value: "1001-5000", label: "1001-5000 employees" },
    { value: "5001-10000", label: "5001-10000 employees" },
    { value: "10001+", label: "10001+ employees" },
  ];

  const lifecycleStages = [
    { value: "subscriber", label: "Subscriber" },
    { value: "lead", label: "Lead" },
    { value: "marketing_qualified_lead", label: "Marketing Qualified Lead" },
    { value: "sales_qualified_lead", label: "Sales Qualified Lead" },
    { value: "opportunity", label: "Opportunity" },
    { value: "customer", label: "Customer" },
    { value: "evangelist", label: "Evangelist" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} data-testid="input-company-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Legal entity name" {...field} data-testid="input-legal-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-industry">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map(industry => (
                            <SelectItem key={industry.value} value={industry.value}>
                              {industry.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companyTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employeeCountRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Count</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-employee-count">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employeeCounts.map(count => (
                            <SelectItem key={count.value} value={count.value}>
                              {count.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="foundedYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Founded Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1800" 
                          max={new Date().getFullYear()}
                          placeholder="e.g., 2010" 
                          {...field}
                          value={field.value || ''}
                          data-testid="input-founded-year"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Web & Social */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Web & Social
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input 
                          type="url" 
                          placeholder="https://company.com" 
                          {...field} 
                          data-testid="input-website-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input 
                          type="url" 
                          placeholder="https://linkedin.com/company/..." 
                          {...field} 
                          data-testid="input-linkedin-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="emailDomains"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Domains</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Add email domain (e.g., company.com)"
                        data-testid="tag-input-email-domains"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3} 
                        placeholder="Brief description of the company..." 
                        {...field} 
                        data-testid="textarea-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialties/Tags</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Add specialty tags..."
                        data-testid="tag-input-specialties"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lifecycleStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lifecycle Stage</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-lifecycle-stage">
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lifecycleStages.map(stage => (
                            <SelectItem key={stage.value} value={stage.value}>
                              {stage.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recordStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-record-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Add tags..."
                        data-testid="tag-input-tags"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              data-testid="button-save-company"
            >
              {isSubmitting ? "Saving..." : company ? "Update Company" : "Save Company"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
