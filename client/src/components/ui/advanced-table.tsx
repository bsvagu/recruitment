"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Eye, Edit, MoreHorizontal, Building2 } from "lucide-react";

type Contact = {
  name: string;
  email: string;
  avatar?: string;
  role: string;
};

type CompanyData = {
  id: string;
  name: string;
  domain?: string;
  status: "active" | "inactive" | "prospect" | "customer";
  industry?: string;
  size?: string;
  location?: string;
  createdAt: string;
  contacts: Contact[];
};

const allColumns = [
  "Company",
  "Domain",
  "Industry", 
  "Size",
  "Location",
  "Contacts",
  "Status",
] as const;

interface AdvancedTableProps {
  data: CompanyData[];
  isLoading?: boolean;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

function AdvancedTable({ data, isLoading = false, onEdit, onView }: AdvancedTableProps) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([...allColumns]);
  const [statusFilter, setStatusFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");

  const filteredData = data.filter((company) => {
    return (
      (!statusFilter || company.status === statusFilter) &&
      (!industryFilter || company.industry?.toLowerCase().includes(industryFilter.toLowerCase()))
    );
  });

  const toggleColumn = (col: string) => {
    setVisibleColumns((prev) =>
      prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 text-white";
      case "inactive":
        return "bg-gray-400 text-white";
      case "prospect":
        return "bg-green-500 text-white";
      case "customer":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getCompanyInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="container my-10 space-y-4 p-4 border border-border rounded-none bg-background shadow-sm overflow-x-auto">
        <div className="animate-pulse">
          <div className="flex gap-4 items-center justify-between mb-6">
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded w-48"></div>
              <div className="h-10 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-10 space-y-4 p-4 border border-border rounded-none bg-background shadow-sm overflow-x-auto">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Filter by industry..."
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="w-48"
            data-testid="input-filter-industry"
          />
          <Input
            placeholder="Filter by status..."
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
            data-testid="input-filter-status"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" data-testid="button-columns">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {allColumns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col}
                checked={visibleColumns.includes(col)}
                onCheckedChange={() => toggleColumn(col)}
                data-testid={`checkbox-column-${col.toLowerCase().replace(' ', '-')}`}
              >
                {col}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            {visibleColumns.includes("Company") && <TableHead className="w-[180px]">Company</TableHead>}
            {visibleColumns.includes("Domain") && <TableHead className="w-[200px]">Domain</TableHead>}
            {visibleColumns.includes("Industry") && <TableHead className="w-[150px]">Industry</TableHead>}
            {visibleColumns.includes("Size") && <TableHead className="w-[120px]">Size</TableHead>}
            {visibleColumns.includes("Location") && <TableHead className="w-[150px]">Location</TableHead>}
            {visibleColumns.includes("Contacts") && <TableHead className="w-[150px]">Contacts</TableHead>}
            {visibleColumns.includes("Status") && <TableHead className="w-[100px]">Status</TableHead>}
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length ? (
            filteredData.map((company) => (
              <TableRow key={company.id} data-testid={`row-company-${company.id}`}>
                {visibleColumns.includes("Company") && (
                  <TableCell className="font-medium whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-none bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {getCompanyInitials(company.name)}
                      </div>
                      <span data-testid={`text-company-name-${company.id}`}>{company.name}</span>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes("Domain") && (
                  <TableCell className="whitespace-nowrap">
                    {company.domain ? (
                      <a
                        href={`https://${company.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-500 underline hover:text-green-600"
                        data-testid={`link-company-domain-${company.id}`}
                      >
                        {company.domain}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                )}
                {visibleColumns.includes("Industry") && (
                  <TableCell className="whitespace-nowrap" data-testid={`text-company-industry-${company.id}`}>
                    {company.industry || "—"}
                  </TableCell>
                )}
                {visibleColumns.includes("Size") && (
                  <TableCell className="whitespace-nowrap" data-testid={`text-company-size-${company.id}`}>
                    {company.size || "—"}
                  </TableCell>
                )}
                {visibleColumns.includes("Location") && (
                  <TableCell className="whitespace-nowrap" data-testid={`text-company-location-${company.id}`}>
                    {company.location || "—"}
                  </TableCell>
                )}
                {visibleColumns.includes("Contacts") && (
                  <TableCell className="min-w-[120px]">
                    <div className="flex -space-x-2">
                      <TooltipProvider>
                        {company.contacts.slice(0, 3).map((contact, idx) => (
                          <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                              <Avatar className="h-8 w-8 ring-2 ring-white hover:z-10">
                                <AvatarImage src={contact.avatar} alt={contact.name} />
                                <AvatarFallback className="text-xs">
                                  {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent className="text-sm">
                              <p className="font-semibold">{contact.name}</p>
                              <p className="text-xs text-muted-foreground">{contact.email}</p>
                              <p className="text-xs italic">{contact.role}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {company.contacts.length > 3 && (
                          <div className="h-8 w-8 rounded-none bg-muted border-2 border-white flex items-center justify-center text-xs font-medium">
                            +{company.contacts.length - 3}
                          </div>
                        )}
                      </TooltipProvider>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes("Status") && (
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      className={cn("whitespace-nowrap", getStatusColor(company.status))}
                      data-testid={`badge-company-status-${company.id}`}
                    >
                      {company.status}
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView?.(company.id)}
                      data-testid={`button-view-company-${company.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit?.(company.id)}
                      data-testid={`button-edit-company-${company.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-more-company-${company.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuCheckboxItem>Archive</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Duplicate</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem className="text-destructive">Delete</DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + 1} className="text-center py-6">
                No companies found matching your criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default AdvancedTable;