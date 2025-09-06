import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Eye, Edit, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactForm from "@/components/contact-form";
import { Contact } from "@/lib/types";

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [seniorityFilter, setSeniorityFilter] = useState("all");
  const [lifecycleStageFilter, setLifecycleStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt:desc");
  const [pageSize, setPageSize] = useState(25);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: contactsData, isLoading, error } = useQuery({
    queryKey: ["/api/contacts", { 
      q: searchQuery || undefined, 
      seniority: seniorityFilter !== "all" ? seniorityFilter : undefined, 
      lifecycleStage: lifecycleStageFilter !== "all" ? lifecycleStageFilter : undefined, 
      recordStatus: statusFilter !== "all" ? statusFilter : undefined, 
      sort: sortBy, 
      limit: pageSize 
    }],
    refetchOnWindowFocus: false,
  });

  const contacts = contactsData?.data || [];
  const meta = contactsData?.meta || { count: 0, total: 0, hasNext: false };

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
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
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

  const getContactInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const updated = new Date(date);
    const diffInHours = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} months ago`;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-destructive">Error loading contacts</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern 21st.dev Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Contacts</h1>
              <p className="text-muted-foreground">Manage your professional network and relationships</p>
            </div>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-add-contact">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <ContactForm onSuccess={() => setIsCreateModalOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Modern 21st.dev Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meta.total}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.filter(c => c.recordStatus === 'active').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads</CardTitle>
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.filter(c => c.lifecycleStage === 'lead').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <div className="h-2 w-2 bg-purple-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.filter(c => c.lifecycleStage === 'customer').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  type="text"
                  placeholder="Search contacts by name, title, email, company..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-contacts"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select value={seniorityFilter} onValueChange={setSeniorityFilter}>
                <SelectTrigger className="w-40" data-testid="select-seniority-filter">
                  <SelectValue placeholder="All Seniority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seniority</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="vp">VP</SelectItem>
                  <SelectItem value="c_level">C-Level</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={lifecycleStageFilter} onValueChange={setLifecycleStageFilter}>
                <SelectTrigger className="w-40" data-testid="select-lifecycle-filter">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="marketing_qualified_lead">MQL</SelectItem>
                  <SelectItem value="sales_qualified_lead">SQL</SelectItem>
                  <SelectItem value="opportunity">Opportunity</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="shadow-sm">
        {/* Table Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground" data-testid="text-results-count">
              Showing <span className="font-medium text-foreground">{meta.count}</span> of{" "}
              <span className="font-medium text-foreground">{meta.total}</span> contacts
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48" data-testid="select-sort-by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastName:asc">Last Name A-Z</SelectItem>
                <SelectItem value="lastName:desc">Last Name Z-A</SelectItem>
                <SelectItem value="firstName:asc">First Name A-Z</SelectItem>
                <SelectItem value="firstName:desc">First Name Z-A</SelectItem>
                <SelectItem value="updatedAt:desc">Recently Updated</SelectItem>
                <SelectItem value="createdAt:desc">Recently Added</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Table Content */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox data-testid="checkbox-select-all" />
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Seniority</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <p className="text-sm">No contacts found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact: Contact) => (
                  <TableRow key={contact.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-contact-${contact.id}`}>
                    <TableCell>
                      <Checkbox data-testid={`checkbox-contact-${contact.id}`} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-sm font-medium">
                            {getContactInitials(contact.firstName, contact.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-foreground" data-testid={`text-contact-name-${contact.id}`}>
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground" data-testid={`text-contact-headline-${contact.id}`}>
                            {contact.headline || "No headline"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground" data-testid={`text-contact-company-${contact.id}`}>
                        {contact.companyNameSnapshot || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground" data-testid={`text-contact-title-${contact.id}`}>
                        {contact.title || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground" data-testid={`text-contact-seniority-${contact.id}`}>
                        {contact.seniority || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getLifecycleStageColor(contact.lifecycleStage || "lead")} border-0`} data-testid={`badge-contact-stage-${contact.id}`}>
                        {contact.lifecycleStage?.replace("_", " ") || "lead"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(contact.recordStatus)} border-0`} data-testid={`badge-contact-status-${contact.id}`}>
                        {contact.recordStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground" data-testid={`text-contact-updated-${contact.id}`}>
                      {formatTimeAgo(contact.updatedAt instanceof Date ? contact.updatedAt.toISOString() : contact.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="icon" title="View Details" data-testid={`button-view-contact-${contact.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit Contact" data-testid={`button-edit-contact-${contact.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" title="More Options" data-testid={`button-more-contact-${contact.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Archive</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
              <SelectTrigger className="w-20" data-testid="select-page-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled data-testid="button-previous-page">
              Previous
            </Button>
            <div className="flex space-x-1">
              <Button variant="default" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <span className="px-3 py-2 text-sm text-muted-foreground">...</span>
              <Button variant="outline" size="sm">10</Button>
            </div>
            <Button variant="outline" size="sm" disabled={!meta.hasNext} data-testid="button-next-page">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
