import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, Building, Mail, Phone, MapPin, Edit, Briefcase } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Contact, Company } from "@/lib/types";

export default function ContactDetail() {
  const { id } = useParams();

  const { data: contactData, isLoading, error } = useQuery({
    queryKey: ["/api/contacts", id, { include: "addresses,emails,phones,company" }],
    enabled: !!id,
  });

  const contact = contactData?.data as Contact & {
    addresses?: any[];
    emails?: any[];
    phones?: any[];
    company?: Company;
  };

  const getContactInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "archived":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getLifecycleStageColor = (stage: string) => {
    switch (stage) {
      case "lead":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "marketing_qualified_lead":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "sales_qualified_lead":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "opportunity":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "customer":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatSeniority = (seniority: string) => {
    return seniority.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatLifecycleStage = (stage: string) => {
    return stage.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-destructive">Error loading contact</h2>
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

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Contact not found</h2>
          <p className="text-muted-foreground">The contact you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/contacts">
            <Button variant="ghost" size="sm" data-testid="button-back-to-contacts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contacts
            </Button>
          </Link>
        </div>
        <Button data-testid="button-edit-contact">
          <Edit className="h-4 w-4 mr-2" />
          Edit Contact
        </Button>
      </div>

      {/* Contact Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl font-bold">
                {getContactInitials(contact.firstName, contact.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-contact-name">
                  {contact.preferredName || `${contact.firstName} ${contact.lastName}`}
                </h1>
                <Badge className={`${getStatusColor(contact.recordStatus)} border-0`}>
                  {contact.recordStatus}
                </Badge>
                <Badge className={`${getLifecycleStageColor(contact.lifecycleStage || "lead")} border-0`}>
                  {formatLifecycleStage(contact.lifecycleStage || "lead")}
                </Badge>
              </div>
              {contact.headline && (
                <p className="text-lg text-muted-foreground mb-2" data-testid="text-contact-headline">
                  {contact.headline}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {contact.title && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{contact.title}</span>
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <Link href={`/companies/${contact.company.id}`}>
                      <span className="text-primary hover:underline">
                        {contact.company.name}
                      </span>
                    </Link>
                  </div>
                )}
                {contact.seniority && (
                  <div className="flex items-center gap-1">
                    <span>{formatSeniority(contact.seniority)}</span>
                  </div>
                )}
                {contact.locationLabel && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{contact.locationLabel}</span>
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
          <TabsTrigger value="employment">Company & Employment</TabsTrigger>
          <TabsTrigger value="contact-info">Contact Info</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Full Name</span>
                      <p className="text-sm">
                        {[contact.prefix, contact.firstName, contact.middleName, contact.lastName, contact.suffix]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Preferred Name</span>
                      <p className="text-sm">{contact.preferredName || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Pronouns</span>
                      <p className="text-sm">{contact.pronouns || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Lifecycle Stage</span>
                      <p className="text-sm">{formatLifecycleStage(contact.lifecycleStage || "lead")}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Record Status</span>
                      <p className="text-sm">{contact.recordStatus}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Created</span>
                      <p className="text-sm">{formatDate(contact.createdAt)}</p>
                    </div>
                  </div>

                  {contact.linkedinUrl && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">LinkedIn</span>
                      <p className="text-sm">
                        <a 
                          href={contact.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View LinkedIn Profile
                        </a>
                      </p>
                    </div>
                  )}

                  {contact.tags && contact.tags.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Tags</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {contact.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Current Employment */}
              {contact.company && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Current Employment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Company</span>
                        <p className="text-sm">
                          <Link href={`/companies/${contact.company.id}`}>
                            <span className="text-primary hover:underline">
                              {contact.company.name}
                            </span>
                          </Link>
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Job Title</span>
                        <p className="text-sm">{contact.title || "—"}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Department</span>
                        <p className="text-sm">{contact.department || "—"}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Seniority</span>
                        <p className="text-sm">{contact.seniority ? formatSeniority(contact.seniority) : "—"}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Employment Start</span>
                        <p className="text-sm">
                          {contact.employmentStartDate ? formatDate(contact.employmentStartDate) : "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Current Employee</span>
                        <p className="text-sm">
                          {contact.isCurrentEmployee ? "Yes" : "No"}
                          {!contact.isCurrentEmployee && contact.employmentEndDate && (
                            <span className="text-muted-foreground ml-1">
                              (Until {formatDate(contact.employmentEndDate)})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
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
                <CardContent className="space-y-4">
                  {/* Emails */}
                  {contact.emails && contact.emails.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-2">
                        <Mail className="h-4 w-4" />
                        Email Addresses
                      </span>
                      {contact.emails.map((email, index) => (
                        <div key={index} className="flex items-center justify-between text-sm mb-2">
                          <div>
                            <div className="font-medium">{email.email}</div>
                            <div className="text-xs text-muted-foreground">{email.type}</div>
                          </div>
                          <div className="flex gap-1">
                            {email.isPrimary && (
                              <Badge variant="outline" className="text-xs">Primary</Badge>
                            )}
                            {email.isVerified && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Phones */}
                  {contact.phones && contact.phones.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-2">
                        <Phone className="h-4 w-4" />
                        Phone Numbers
                      </span>
                      {contact.phones.map((phone, index) => (
                        <div key={index} className="flex items-center justify-between text-sm mb-2">
                          <div>
                            <div className="font-medium">{phone.phone}</div>
                            <div className="text-xs text-muted-foreground">{phone.type}</div>
                          </div>
                          <div className="flex gap-1">
                            {phone.isPrimary && (
                              <Badge variant="outline" className="text-xs">Primary</Badge>
                            )}
                            {phone.isVerified && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Location */}
                  {contact.locationLabel && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </span>
                      <p className="text-sm">{contact.locationLabel}</p>
                      {contact.timeZone && (
                        <p className="text-xs text-muted-foreground">Timezone: {contact.timeZone}</p>
                      )}
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
                    <span className="text-sm text-muted-foreground">Addresses</span>
                    <span className="text-sm font-medium">{contact.addresses?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email Addresses</span>
                    <span className="text-sm font-medium">{contact.emails?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Phone Numbers</span>
                    <span className="text-sm font-medium">{contact.phones?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Employee</span>
                    <span className="text-sm font-medium">{contact.isCurrentEmployee ? "Yes" : "No"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="employment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employment History</CardTitle>
            </CardHeader>
            <CardContent>
              {contact.employmentHistory && Array.isArray(contact.employmentHistory) && contact.employmentHistory.length > 0 ? (
                <div className="space-y-4">
                  {contact.employmentHistory.map((employment: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{employment.title || "Position"}</h4>
                          <p className="text-sm text-muted-foreground">{employment.company || "Company"}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {employment.startDate && (
                            <div>{formatDate(employment.startDate)}</div>
                          )}
                          {employment.endDate ? (
                            <div>- {formatDate(employment.endDate)}</div>
                          ) : (
                            <div>- Present</div>
                          )}
                        </div>
                      </div>
                      {employment.description && (
                        <p className="text-sm text-muted-foreground">{employment.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No employment history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact-info" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Addresses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Addresses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contact.addresses && contact.addresses.length > 0 ? (
                  <div className="space-y-4">
                    {contact.addresses.map((address, index) => (
                      <div key={index} className="border rounded-lg p-4">
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
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No addresses on file</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Communication Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Communication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Primary Email</span>
                  <p className="text-sm">
                    {contact.emails?.find(e => e.isPrimary)?.email || 
                     contact.emails?.[0]?.email || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Primary Phone</span>
                  <p className="text-sm">
                    {contact.phones?.find(p => p.isPrimary)?.phone || 
                     contact.phones?.[0]?.phone || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Preferred Contact Method</span>
                  <p className="text-sm">Email (Default)</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Time Zone</span>
                  <p className="text-sm">{contact.timeZone || "Not specified"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {contact.notes ? (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{contact.notes}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No notes available for this contact</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
