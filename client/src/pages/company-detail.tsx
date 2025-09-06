import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building, Globe, MapPin, Phone, Mail, Edit } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Company, Contact } from "@/lib/types";

export default function CompanyDetail() {
  const { id } = useParams();

  const { data: companyData, isLoading, error } = useQuery({
    queryKey: ["/api/companies", id, { include: "addresses,emails,phones,contacts" }],
    enabled: !!id,
  });

  const company = companyData?.data as Company & {
    addresses?: any[];
    emails?: any[];
    phones?: any[];
    contacts?: Contact[];
  };

  const getCompanyInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "prospect":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "customer":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-destructive">Error loading company</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Company not found</h2>
          <p className="text-muted-foreground">The company you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/companies">
            <Button variant="ghost" size="sm" data-testid="button-back-to-companies">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
            </Button>
          </Link>
        </div>
        <Button data-testid="button-edit-company">
          <Edit className="h-4 w-4 mr-2" />
          Edit Company
        </Button>
      </div>

      {/* Company Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-6">
            <div className="h-20 w-20 rounded-none bg-gradient-to-br from-blue-500 to-green-600 flex items-center justify-center text-white font-bold text-2xl">
              {getCompanyInitials(company.name)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-company-name">
                  {company.name}
                </h1>
                <Badge className={`${getStatusColor(company.recordStatus)} border-0`}>
                  {company.recordStatus}
                </Badge>
              </div>
              {company.legalName && company.legalName !== company.name && (
                <p className="text-lg text-muted-foreground mb-2">
                  Legal Name: {company.legalName}
                </p>
              )}
              {company.description && (
                <p className="text-muted-foreground mb-4" data-testid="text-company-description">
                  {company.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {company.industry && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{company.industry}</span>
                  </div>
                )}
                {company.employeeCountRange && (
                  <div className="flex items-center gap-1">
                    <span>{company.employeeCountRange} employees</span>
                  </div>
                )}
                {company.foundedYear && (
                  <div className="flex items-center gap-1">
                    <span>Founded {company.foundedYear}</span>
                  </div>
                )}
                {company.websiteUrl && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={company.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({company.contacts?.length || 0})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 border border-gray-200 dark:border-gray-700 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Company Type</span>
                      <p className="text-sm">{company.companyType || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Industry</span>
                      <p className="text-sm">{company.industry || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Employee Count</span>
                      <p className="text-sm">{company.employeeCountRange || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Founded</span>
                      <p className="text-sm">{company.foundedYear || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Lifecycle Stage</span>
                      <p className="text-sm">{company.lifecycleStage || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Created</span>
                      <p className="text-sm">{formatDate(company.createdAt)}</p>
                    </div>
                  </div>

                  {company.specialties && company.specialties.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Specialties</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {company.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {company.tags && company.tags.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Tags</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {company.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Addresses */}
              {company.addresses && company.addresses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Addresses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 border border-gray-200 dark:border-gray-700 p-4">
                    {company.addresses.map((address, index) => (
                      <div key={index} className="border rounded-none p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {address.label || address.type}
                          </span>
                          {address.isPrimary && (
                            <Badge variant="outline">Primary</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {address.street1 && <div>{address.street1}</div>}
                          {address.street2 && <div>{address.street2}</div>}
                          <div>
                            {[address.city, address.state, address.postalCode]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                          {address.countryCode && <div>{address.countryCode}</div>}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 border border-gray-200 dark:border-gray-700 p-4">
                  {/* Emails */}
                  {company.emails && company.emails.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-2">
                        <Mail className="h-4 w-4" />
                        Email Addresses
                      </span>
                      {company.emails.map((email, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div>
                            <div className="font-medium">{email.email}</div>
                            <div className="text-xs text-muted-foreground">{email.type}</div>
                          </div>
                          {email.isPrimary && (
                            <Badge variant="outline" className="text-xs">Primary</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Phones */}
                  {company.phones && company.phones.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-2">
                        <Phone className="h-4 w-4" />
                        Phone Numbers
                      </span>
                      {company.phones.map((phone, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div>
                            <div className="font-medium">{phone.phone}</div>
                            <div className="text-xs text-muted-foreground">{phone.type}</div>
                          </div>
                          {phone.isPrimary && (
                            <Badge variant="outline" className="text-xs">Primary</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Email Domains */}
                  {company.emailDomains && company.emailDomains.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground mb-2 block">
                        Email Domains
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {company.emailDomains.map((domain, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {domain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Contacts</span>
                    <span className="text-sm font-medium">{company.contacts?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Addresses</span>
                    <span className="text-sm font-medium">{company.addresses?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email Addresses</span>
                    <span className="text-sm font-medium">{company.emails?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Phone Numbers</span>
                    <span className="text-sm font-medium">{company.phones?.length || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {company.contacts && company.contacts.length > 0 ? (
                <div className="space-y-4 border border-gray-200 dark:border-gray-700 p-4">
                  {company.contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center space-x-4 p-4 border rounded-none">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-sm font-medium">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </div>
                        {contact.title && (
                          <div className="text-sm text-muted-foreground">{contact.title}</div>
                        )}
                        {contact.headline && (
                          <div className="text-xs text-muted-foreground mt-1">{contact.headline}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {contact.lifecycleStage?.replace("_", " ") || "lead"}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {contact.seniority || "—"}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No contacts found for this company</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Activity tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
