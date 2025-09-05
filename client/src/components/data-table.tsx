import { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface Action<T> {
  label: string;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  sorting?: {
    sortBy: string;
    onSortChange: (sortBy: string) => void;
    options: { value: string; label: string }[];
  };
  selection?: {
    selectedItems: Set<string>;
    onSelectionChange: (selectedItems: Set<string>) => void;
    getItemId: (item: T) => string;
  };
  emptyMessage?: string;
  className?: string;
}

export default function DataTable<T>({
  data,
  columns,
  actions,
  loading = false,
  pagination,
  sorting,
  selection,
  emptyMessage = "No data available",
  className,
}: DataTableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (!selection) return;
    
    if (checked) {
      const allIds = new Set(data.map(selection.getItemId));
      selection.onSelectionChange(allIds);
    } else {
      selection.onSelectionChange(new Set());
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (!selection) return;
    
    const newSelection = new Set(selection.selectedItems);
    if (checked) {
      newSelection.add(itemId);
    } else {
      newSelection.delete(itemId);
    }
    selection.onSelectionChange(newSelection);
  };

  const isAllSelected = selection
    ? data.length > 0 && data.every(item => selection.selectedItems.has(selection.getItemId(item)))
    : false;

  const isIndeterminate = selection
    ? selection.selectedItems.size > 0 && !isAllSelected
    : false;

  return (
    <div className={className}>
      {/* Table Header */}
      {(pagination || sorting) && (
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-4">
            {pagination && (
              <span className="text-sm text-muted-foreground" data-testid="table-count">
                Showing <span className="font-medium text-foreground">{data.length}</span> of{" "}
                <span className="font-medium text-foreground">{pagination.total}</span> items
              </span>
            )}
          </div>

          {sorting && (
            <div className="flex items-center space-x-3">
              <Select value={sorting.sortBy} onValueChange={sorting.onSortChange}>
                <SelectTrigger className="w-48" data-testid="table-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sorting.options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {selection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                </TableHead>
              )}
              {columns.map(column => (
                <TableHead key={column.key} style={{ width: column.width }}>
                  {column.label}
                </TableHead>
              ))}
              {actions && actions.length > 0 && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {selection && (
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  )}
                  {columns.map(column => (
                    <TableCell key={column.key}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                  {actions && actions.length > 0 && (
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  )}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selection ? 1 : 0) + (actions?.length ? 1 : 0)} 
                  className="text-center py-8"
                >
                  <div className="text-muted-foreground">
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => {
                const itemId = selection?.getItemId(item) || index.toString();
                const isSelected = selection?.selectedItems.has(itemId) || false;
                
                return (
                  <TableRow
                    key={itemId}
                    className="hover:bg-muted/30 transition-colors"
                    onMouseEnter={() => setHoveredRow(itemId)}
                    onMouseLeave={() => setHoveredRow(null)}
                    data-testid={`table-row-${itemId}`}
                  >
                    {selection && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectItem(itemId, !!checked)}
                          data-testid={`checkbox-item-${itemId}`}
                        />
                      </TableCell>
                    )}
                    {columns.map(column => (
                      <TableCell key={column.key} data-testid={`cell-${column.key}-${itemId}`}>
                        {column.render ? column.render(item) : String((item as any)[column.key] || '')}
                      </TableCell>
                    ))}
                    {actions && actions.length > 0 && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {actions.length <= 3 ? (
                            actions.map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                variant="ghost"
                                size="sm"
                                onClick={() => action.onClick(item)}
                                className={action.variant === "destructive" ? "text-destructive hover:text-destructive" : ""}
                                data-testid={`action-${action.label.toLowerCase().replace(/\s+/g, '-')}-${itemId}`}
                              >
                                {action.label}
                              </Button>
                            ))
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  data-testid={`actions-menu-${itemId}`}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {actions.map((action, actionIndex) => (
                                  <DropdownMenuItem
                                    key={actionIndex}
                                    onClick={() => action.onClick(item)}
                                    className={action.variant === "destructive" ? "text-destructive" : ""}
                                  >
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select 
              value={pagination.pageSize.toString()} 
              onValueChange={(value) => pagination.onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-20" data-testid="page-size-select">
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
            <Button 
              variant="outline" 
              size="sm" 
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              data-testid="previous-page"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {pagination.page}
            </span>

            <Button 
              variant="outline" 
              size="sm" 
              disabled={!pagination.hasNext}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              data-testid="next-page"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
