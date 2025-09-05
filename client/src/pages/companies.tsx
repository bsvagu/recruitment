import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Eye, Edit, MoreHorizontal, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div>
      {/* Swigify-style Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8" data-testid="text-page-title">Companies</h1>
        
        {/* Tabs - Swigify Style */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-transparent border-0 p-0 h-auto space-x-8">
              <TabsTrigger 
                value="all" 
                className="bg-transparent border-0 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none px-0 pb-2 text-gray-600 data-[state=active]:text-blue-600 font-medium"
              >
                All companies
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className="bg-transparent border-0 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none px-0 pb-2 text-gray-600 data-[state=active]:text-blue-600 font-medium"
              >
                Active
              </TabsTrigger>
              <TabsTrigger 
                value="prospects" 
                className="bg-transparent border-0 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none px-0 pb-2 text-gray-600 data-[state=active]:text-blue-600 font-medium"
              >
                Prospects
              </TabsTrigger>
              <TabsTrigger 
                value="customers" 
                className="bg-transparent border-0 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none px-0 pb-2 text-gray-600 data-[state=active]:text-blue-600 font-medium"
              >
                Customers
              </TabsTrigger>
            </TabsList>
            
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg" data-testid="button-add-company">
              <Plus className="h-4 w-4 mr-2" />
              Add Companies
            </Button>
          </div>
          
          {/* Filter and Search Bar - Swigify Style */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="font-medium text-gray-900">All companies</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    type="text"
                    placeholder="Search for customer Name & ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                    data-testid="input-search-companies"
                  />
                </div>
                <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>
          <TabsContent value="all" className="mt-0">
            <CompaniesTable 
              companies={companies} 
              isLoading={isLoading}
              getStatusColor={getStatusColor}
              getCompanyInitials={getCompanyInitials}
              formatTimeAgo={formatTimeAgo}
            />
          </TabsContent>
          
          <TabsContent value="active" className="mt-0">
            <CompaniesTable 
              companies={companies.filter((c: Company) => c.recordStatus === 'active')} 
              isLoading={isLoading}
              getStatusColor={getStatusColor}
              getCompanyInitials={getCompanyInitials}
              formatTimeAgo={formatTimeAgo}
            />
          </TabsContent>
          
          <TabsContent value="prospects" className="mt-0">
            <CompaniesTable 
              companies={companies.filter((c: Company) => c.recordStatus === 'prospect')} 
              isLoading={isLoading}
              getStatusColor={getStatusColor}
              getCompanyInitials={getCompanyInitials}
              formatTimeAgo={formatTimeAgo}
            />
          </TabsContent>
          
          <TabsContent value="customers" className="mt-0">
            <CompaniesTable 
              companies={companies.filter((c: Company) => c.recordStatus === 'customer')} 
              isLoading={isLoading}
              getStatusColor={getStatusColor}
              getCompanyInitials={getCompanyInitials}
              formatTimeAgo={formatTimeAgo}
            />
          </TabsContent>
        </Tabs>

        
        {/* Dialog for adding companies */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
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
    </div>
  );
}

// Swigify-style table component
function CompaniesTable({ companies, isLoading, getStatusColor, getCompanyInitials, formatTimeAgo }: {
  companies: Company[];
  isLoading: boolean;
  getStatusColor: (status: string) => string;
  getCompanyInitials: (name: string) => string;
  formatTimeAgo: (date: string) => string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-6 gap-4">
          <span className="text-sm font-medium text-gray-900">COMPANY ID</span>
          <span className="text-sm font-medium text-gray-900">COMPANY NAME</span>
          <span className="text-sm font-medium text-gray-900">INDUSTRY</span>
          <span className="text-sm font-medium text-gray-900">LOCATION</span>
          <span className="text-sm font-medium text-gray-900">EMPLOYEES</span>
          <span className="text-sm font-medium text-gray-900">STATUS</span>
        </div>
      </div>
      
      {/* Table Body */}
      <div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="px-6 py-4 border-b border-gray-100 last:border-0">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>No companies found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          companies.map((company: Company) => (
            <div key={company.id} className="px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors" data-testid={`row-company-${company.id}`}>
              <div className="grid grid-cols-6 gap-4 items-center">
                <span className="text-sm text-gray-900 font-mono" data-testid={`text-company-id-${company.id}`}>
                  {company.id.slice(0, 8)}
                </span>
                <span className="text-sm font-medium text-gray-900" data-testid={`text-company-name-${company.id}`}>
                  {company.name}
                </span>
                <span className="text-sm text-gray-600" data-testid={`text-company-industry-${company.id}`}>
                  {company.industry || '—'}
                </span>
                <span className="text-sm text-gray-600" data-testid={`text-company-location-${company.id}`}>
                  {(company as any).headquarters || company.description?.slice(0, 20) || '—'}
                </span>
                <span className="text-sm text-gray-600" data-testid={`text-company-employees-${company.id}`}>
                  {company.employeeCountRange || '—'}
                </span>
                <div>
                  <Badge className={`${getStatusColor(company.recordStatus || 'inactive')} border-0 text-xs font-medium`} data-testid={`badge-company-status-${company.id}`}>
                    {company.recordStatus || 'inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
