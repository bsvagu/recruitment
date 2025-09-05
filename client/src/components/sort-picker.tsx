import { ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SortOption {
  value: string;
  label: string;
}

interface SortPickerProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SortOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function SortPicker({
  value,
  onValueChange,
  options,
  placeholder = "Sort by...",
  className,
  disabled = false,
}: SortPickerProps) {
  return (
    <Select 
      value={value} 
      onValueChange={onValueChange} 
      disabled={disabled}
    >
      <SelectTrigger className={className} data-testid="sort-picker">
        <SelectValue placeholder={placeholder} />
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            data-testid={`sort-option-${option.value}`}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
