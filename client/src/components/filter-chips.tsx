import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FilterChip {
  key: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemove?: (key: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export default function FilterChips({ 
  filters, 
  onRemove, 
  onClearAll, 
  className 
}: FilterChipsProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="filter-chips-container">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      
      {filters.map((filter) => (
        <Badge 
          key={filter.key} 
          variant="secondary" 
          className="flex items-center gap-2 px-3 py-1"
          data-testid={`filter-chip-${filter.key}`}
        >
          <span>{filter.label}: {filter.value}</span>
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-secondary/80"
              onClick={() => onRemove(filter.key)}
              data-testid={`button-remove-filter-${filter.key}`}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Badge>
      ))}
      
      {onClearAll && filters.length > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-foreground"
          data-testid="button-clear-all-filters"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
