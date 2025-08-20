
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  id: string;
  label: string;
  category: 'type' | 'bodyRegion' | 'goal';
}

interface WorkoutFiltersProps {
  activeFilters: string[];
  onFiltersChange: (filters: string[]) => void;
  className?: string;
}

const filterOptions: FilterOption[] = [
  // Type filters
  { id: 'ai-generated', label: 'AI Generated', category: 'type' },
  { id: 'custom', label: 'Custom', category: 'type' },
  { id: 'templates', label: 'Templates', category: 'type' },
  
  // Body region filters
  { id: 'upper-body', label: 'Upper Body', category: 'bodyRegion' },
  { id: 'lower-body', label: 'Lower Body', category: 'bodyRegion' },
  { id: 'core', label: 'Core', category: 'bodyRegion' },
  { id: 'full-body', label: 'Full Body', category: 'bodyRegion' },
  
  // Goal filters
  { id: 'strength', label: 'Strength', category: 'goal' },
  { id: 'hypertrophy', label: 'Hypertrophy', category: 'goal' },
  { id: 'endurance', label: 'Endurance', category: 'goal' },
  { id: 'conditioning', label: 'Conditioning', category: 'goal' },
];

export function WorkoutFilters({ activeFilters, onFiltersChange, className }: WorkoutFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleFilter = (filterId: string) => {
    if (activeFilters.includes(filterId)) {
      onFiltersChange(activeFilters.filter(f => f !== filterId));
    } else {
      onFiltersChange([...activeFilters, filterId]);
    }
  };
  
  const clearAllFilters = () => {
    onFiltersChange([]);
  };
  
  const groupedFilters = filterOptions.reduce((acc, filter) => {
    if (!acc[filter.category]) {
      acc[filter.category] = [];
    }
    acc[filter.category].push(filter);
    return acc;
  }, {} as Record<string, FilterOption[]>);
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center"
        >
          <Filter size={16} className="mr-2" />
          Filters
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {activeFilters.length}
            </Badge>
          )}
        </Button>
        
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground"
          >
            Clear all
          </Button>
        )}
      </div>
      
      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(filterId => {
            const filter = filterOptions.find(f => f.id === filterId);
            return (
              <Badge
                key={filterId}
                variant="secondary"
                className="flex items-center bg-hashim-100 text-hashim-700"
              >
                {filter?.label}
                <button
                  onClick={() => toggleFilter(filterId)}
                  className="ml-1 hover:bg-hashim-200 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
      
      {/* Expandable filter options */}
      {isExpanded && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg animate-fade-in">
          {Object.entries(groupedFilters).map(([category, filters]) => (
            <div key={category}>
              <h4 className="font-medium text-sm text-muted-foreground mb-2 capitalize">
                {category === 'bodyRegion' ? 'Body Region' : category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {filters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm transition-colors",
                      activeFilters.includes(filter.id)
                        ? "bg-hashim-600 text-white"
                        : "bg-white border border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
