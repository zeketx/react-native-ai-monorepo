# Task: Add Advanced Client Filtering

**ID:** CS-P4-009  
**Phase:** Web Dashboard  
**Dependencies:** CS-P4-007

## Objective
Implement a comprehensive filtering system for the client list with multiple filter types, saved filter presets, and an intuitive UI for complex query building.

## Context
Organizers need powerful filtering capabilities to segment clients based on various criteria for targeted communication and trip planning. The filtering system must be intuitive for basic use while supporting complex queries for power users.

## Requirements
- Multi-criteria filtering
- Filter combination logic (AND/OR)
- Saved filter presets
- Quick filter shortcuts
- Filter state persistence
- URL-based filter sharing

## Technical Guidance
- Build composable filter system
- Use URL query parameters
- Implement filter builder pattern
- Store presets in database
- Apply proper TypeScript types
- Optimize query performance

## Filter Types
```typescript
interface ClientFilterTypes {
  // Basic filters
  search: {
    type: 'text';
    fields: ['name', 'email', 'phone'];
    operator: 'contains' | 'startsWith' | 'exact';
  };
  
  // Categorical filters
  tier: {
    type: 'multiSelect';
    options: ClientTier[];
    operator: 'in' | 'notIn';
  };
  
  status: {
    type: 'multiSelect';
    options: ClientStatus[];
    operator: 'in' | 'notIn';
  };
  
  // Date filters
  joinDate: {
    type: 'dateRange';
    presets: ['today', 'thisWeek', 'thisMonth', 'custom'];
  };
  
  lastTripDate: {
    type: 'dateRange';
    includeNull: boolean; // For "never traveled"
  };
  
  // Numeric filters
  tripCount: {
    type: 'number';
    operator: 'equals' | 'gt' | 'lt' | 'between';
  };
  
  // Boolean filters
  hasUpcomingTrips: {
    type: 'boolean';
  };
  
  hasPreferences: {
    type: 'boolean';
  };
  
  // Relationship filters
  assignedOrganizer: {
    type: 'select';
    options: Organizer[];
  };
  
  // Custom filters
  tags: {
    type: 'multiSelect';
    options: Tag[];
    operator: 'hasAll' | 'hasAny' | 'hasNone';
  };
}
```

## Filter Builder Component
```tsx
// src/components/clients/filters/FilterBuilder.tsx
export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  filters,
  onChange,
  onSave,
}) => {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(
    filters || []
  );
  const [filterLogic, setFilterLogic] = useState<'AND' | 'OR'>('AND');
  
  const addFilter = (type: FilterType) => {
    const newFilter: ActiveFilter = {
      id: generateId(),
      type,
      value: getDefaultValue(type),
      operator: getDefaultOperator(type),
    };
    
    setActiveFilters([...activeFilters, newFilter]);
  };
  
  const updateFilter = (id: string, updates: Partial<ActiveFilter>) => {
    setActiveFilters(
      activeFilters.map(filter =>
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
  };
  
  const removeFilter = (id: string) => {
    setActiveFilters(activeFilters.filter(f => f.id !== id));
  };
  
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filters</h3>
        <div className="flex items-center gap-2">
          <ToggleGroup
            value={filterLogic}
            onValueChange={setFilterLogic}
            options={[
              { value: 'AND', label: 'Match All' },
              { value: 'OR', label: 'Match Any' },
            ]}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        {activeFilters.map((filter, index) => (
          <FilterRow
            key={filter.id}
            filter={filter}
            onChange={(updates) => updateFilter(filter.id, updates)}
            onRemove={() => removeFilter(filter.id)}
            showLogic={index > 0}
            logic={filterLogic}
          />
        ))}
      </div>
      
      <AddFilterDropdown onAdd={addFilter} />
      
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setActiveFilters([])}
          disabled={activeFilters.length === 0}
        >
          Clear All
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onSave?.(activeFilters)}
          >
            Save Preset
          </Button>
          
          <Button
            onClick={() => onChange(buildQuery(activeFilters, filterLogic))}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
```

## Filter Row Component
```tsx
const FilterRow: React.FC<FilterRowProps> = ({
  filter,
  onChange,
  onRemove,
  showLogic,
  logic,
}) => {
  const config = FILTER_CONFIGS[filter.type];
  
  return (
    <div className="flex items-center gap-2">
      {showLogic && (
        <span className="text-xs text-gray-500 w-12 text-center">
          {logic}
        </span>
      )}
      
      <Select
        value={filter.type}
        onChange={(type) => onChange({ type })}
        className="w-40"
      >
        {Object.entries(FILTER_CONFIGS).map(([key, config]) => (
          <option key={key} value={key}>
            {config.label}
          </option>
        ))}
      </Select>
      
      {config.operators && (
        <Select
          value={filter.operator}
          onChange={(operator) => onChange({ operator })}
          className="w-32"
        >
          {config.operators.map(op => (
            <option key={op} value={op}>
              {OPERATOR_LABELS[op]}
            </option>
          ))}
        </Select>
      )}
      
      <FilterValueInput
        type={filter.type}
        value={filter.value}
        onChange={(value) => onChange({ value })}
        config={config}
      />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
```

## Quick Filters
```tsx
// src/components/clients/filters/QuickFilters.tsx
export const QuickFilters: React.FC<QuickFiltersProps> = ({
  onApply,
}) => {
  const quickFilterPresets = [
    {
      label: 'Active Platinum',
      icon: Star,
      filters: {
        tier: ['platinum'],
        status: ['active'],
      },
    },
    {
      label: 'Upcoming Trips',
      icon: Calendar,
      filters: {
        hasUpcomingTrips: true,
      },
    },
    {
      label: 'New This Month',
      icon: UserPlus,
      filters: {
        joinDate: {
          start: startOfMonth(new Date()),
          end: new Date(),
        },
      },
    },
    {
      label: 'Need Preferences',
      icon: AlertCircle,
      filters: {
        hasPreferences: false,
      },
    },
  ];
  
  return (
    <div className="flex gap-2 flex-wrap">
      {quickFilterPresets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          onClick={() => onApply(preset.filters)}
          className="flex items-center gap-2"
        >
          <preset.icon className="h-4 w-4" />
          {preset.label}
        </Button>
      ))}
    </div>
  );
};
```

## Saved Filter Presets
```tsx
interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: ActiveFilter[];
  logic: 'AND' | 'OR';
  createdBy: string;
  isPublic: boolean;
}

export const useSavedFilters = () => {
  const { data: presets, isLoading } = useQuery({
    queryKey: ['filterPresets'],
    queryFn: () => filterService.getPresets(),
  });
  
  const savePreset = useMutation({
    mutationFn: (preset: CreatePresetDto) => 
      filterService.savePreset(preset),
    onSuccess: () => {
      queryClient.invalidateQueries(['filterPresets']);
      toast.success('Filter preset saved');
    },
  });
  
  return {
    presets,
    isLoading,
    savePreset: savePreset.mutate,
  };
};
```

## URL State Sync
```typescript
// src/hooks/useFilterUrlSync.ts
export const useFilterUrlSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const filtersFromUrl = useMemo(() => {
    const filters: ClientFilters = {};
    
    // Parse each filter type from URL
    const tier = searchParams.get('tier');
    if (tier) filters.tier = tier.split(',') as ClientTier[];
    
    const status = searchParams.get('status');
    if (status) filters.status = status.split(',') as ClientStatus[];
    
    const search = searchParams.get('q');
    if (search) filters.search = search;
    
    return filters;
  }, [searchParams]);
  
  const updateUrl = useCallback((filters: ClientFilters) => {
    const params = new URLSearchParams();
    
    if (filters.tier?.length) {
      params.set('tier', filters.tier.join(','));
    }
    
    if (filters.status?.length) {
      params.set('status', filters.status.join(','));
    }
    
    if (filters.search) {
      params.set('q', filters.search);
    }
    
    setSearchParams(params);
  }, [setSearchParams]);
  
  return { filtersFromUrl, updateUrl };
};
```

## Acceptance Criteria
- [ ] All filter types work correctly
- [ ] Filter combinations apply properly
- [ ] Quick filters function
- [ ] Presets save and load
- [ ] URL sync works
- [ ] Performance remains fast

## Where to Create
- `packages/web-dashboard/src/components/clients/filters/`
- `packages/web-dashboard/src/hooks/useFilters.ts`
- `packages/web-dashboard/src/services/filterService.ts`

## Performance Optimization
- Debounce text input filters
- Memoize filter calculations
- Index filtered columns
- Lazy load filter options
- Cache filter results

## Estimated Effort
3.5 hours