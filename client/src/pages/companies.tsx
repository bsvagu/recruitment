import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Eye, Edit, MoreHorizontal, Filter, Building2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import CompanyForm from "@/components/company-form";
import { apiClient } from "@/lib/api";
import { Company } from "@/lib/types";

export default function Companies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt:desc");
  const [pageSize, setPageSize] = useState(25);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { data: companiesData, isLoading, error } = useQuery({
    queryKey: ["/api/companies", { 
      q: searchQuery || undefined, 
      industry: industryFilter !== "all" ? industryFilter : undefined, 
      employeeCountRange: sizeFilter !== "all" ? sizeFilter : undefined, 
      recordStatus: statusFilter !== "all" ? statusFilter : undefined, 
      sort: sortBy, 
      limit: pageSize 
    }],
    refetchOnWindowFocus: false,
  });

  const companies: Company[] = (companiesData as any)?.data || [];
  const meta = (companiesData as any)?.meta || { count: 0, total: 0, hasNext: false };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "prospect":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "customer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getCompanyInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
          <h2 className="text-lg font-semibold text-destructive">Error loading companies</h2>
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Companies</h1>
              <p className="text-muted-foreground">Manage and organize your company database</p>
            </div>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-company">
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <CompanyForm onSuccess={() => setIsCreateModalOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Modern 21st.dev Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meta.total}</div>
              <p className="text-xs text-muted-foreground">+2.5% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.filter(c => c.recordStatus === 'active').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prospects</CardTitle>
              <div className="h-2 w-2 bg-yellow-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.filter(c => c.recordStatus === 'prospect').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.filter(c => c.recordStatus === 'customer').length}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Enhanced Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Companies</CardTitle>
            <CardDescription>Filter and search through your company database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    type="text"
                    placeholder="Search companies by name, domain, industry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-companies"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="w-40" data-testid="select-industry-filter">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32" data-testid="select-status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
        
        {/* Modern 21st.dev Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Companies</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="prospects">Prospects</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <ModernCompaniesTable 
              companies={companies} 
              isLoading={isLoading}
              getStatusColor={getStatusColor}
              getCompanyInitials={getCompanyInitials}
              formatTimeAgo={formatTimeAgo}
            />
          </TabsContent>
          
          <TabsContent value="active" className="mt-4">
            <ModernCompaniesTable 
              companies={companies.filter((c: Company) => c.recordStatus === 'active')} 
              isLoading={isLoading}
              getStatusColor={getStatusColor}
              getCompanyInitials={getCompanyInitials}
              formatTimeAgo={formatTimeAgo}
            />
          </TabsContent>
          
          <TabsContent value="prospects" className="mt-4">
            <ModernCompaniesTable 
              companies={companies.filter((c: Company) => c.recordStatus === 'prospect')} 
              isLoading={isLoading}
              getStatusColor={getStatusColor}
              getCompanyInitials={getCompanyInitials}
              formatTimeAgo={formatTimeAgo}
            />
          </TabsContent>
          
          <TabsContent value="customers" className="mt-4">
            <ModernCompaniesTable 
              companies={companies.filter((c: Company) => c.recordStatus === 'customer')} 
              isLoading={isLoading}
              getStatusColor={getStatusColor}
              getCompanyInitials={getCompanyInitials}
              formatTimeAgo={formatTimeAgo}
            />
          </TabsContent>
        </Tabs>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// Modern 21st.dev table component
function ModernCompaniesTable({ companies, isLoading, getStatusColor, getCompanyInitials, formatTimeAgo }: {
  companies: Company[];
  isLoading: boolean;
  getStatusColor: (status: string) => string;
  getCompanyInitials: (name: string) => string;
  formatTimeAgo: (date: string) => string;
}) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
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
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No companies found matching your criteria. Try adjusting your search or filters.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox data-testid="checkbox-select-all" />
            </TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company: Company) => (
            <TableRow key={company.id} className="hover:bg-muted/50" data-testid={`row-company-${company.id}`}>
              <TableCell>
                <Checkbox data-testid={`checkbox-company-${company.id}`} />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {getCompanyInitials(company.name)}
                  </div>
                  <div>
                    <div className="font-medium" data-testid={`text-company-name-${company.id}`}>
                      {company.name}
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid={`text-company-domain-${company.id}`}>
                      {company.emailDomains?.[0] || "No domain"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm" data-testid={`text-company-industry-${company.id}`}>
                  {company.industry || "—"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm" data-testid={`text-company-size-${company.id}`}>
                  {company.employeeCountRange || "—"}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={getStatusColor(company.recordStatus || 'inactive')} data-testid={`badge-company-status-${company.id}`}>
                  {company.recordStatus || 'inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground" data-testid={`text-company-updated-${company.id}`}>
                {formatTimeAgo(company.updatedAt instanceof Date ? company.updatedAt.toISOString() : company.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button variant="ghost" size="icon" title="View Details" data-testid={`button-view-company-${company.id}`}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit Company" data-testid={`button-edit-company-${company.id}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" title="More Options" data-testid={`button-more-company-${company.id}`}>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
