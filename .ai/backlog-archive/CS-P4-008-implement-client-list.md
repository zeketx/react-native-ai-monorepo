# Task: Implement Client List Component

**ID:** CS-P4-008  
**Phase:** Web Dashboard  
**Dependencies:** CS-P4-007, CS-P4-009

## Objective
Build a feature-rich client list component with advanced filtering, sorting, search, and bulk actions, providing organizers with powerful tools to manage their client base efficiently.

## Context
The client list is the primary interface for organizers to view and manage all clients. It must handle large datasets performantly while providing intuitive filtering and search capabilities. The component should support both table and card views for different use cases.

## Requirements
- Responsive table/card view toggle
- Advanced filter panel
- Real-time search
- Bulk selection and actions
- Column customization
- Export functionality

## Technical Guidance
- Use React Table for data grid
- Implement virtualization
- Apply responsive design
- Create reusable filters
- Handle loading states
- Support keyboard navigation

## Component Architecture
```typescript
interface ClientListProps {
  view?: 'table' | 'cards';
  onClientSelect?: (client: Client) => void;
  actions?: ClientAction[];
}

interface ClientListState {
  view: 'table' | 'cards';
  selectedClients: Set<string>;
  filters: ClientFilters;
  sorting: SortingState;
  columnVisibility: ColumnVisibilityState;
}

interface ClientAction {
  label: string;
  icon: React.ComponentType;
  action: (clients: Client[]) => void;
  requiresPermission?: Permission;
}
```

## Visual Layout
```
┌─────────────────────────────────────────────┐
│ Clients (247)        [Search...]  [+ Filter] │
│                                             │
│ [Table] [Cards]              [Export] [Add] │
├─────────────────────────────────────────────┤
│ □ Name ↓    Email      Tier    Status   ... │
├─────────────────────────────────────────────┤
│ □ John Doe  j@ex.com   Gold    Active   ... │
│ □ Jane Sm.. jane@...   Plat    Active   ... │
│ □ Bob John  bob@co..   Silver  Pending  ... │
├─────────────────────────────────────────────┤
│ [1] 2 3 ... 10  Showing 1-20 of 247        │
└─────────────────────────────────────────────┘
```

## Table Implementation
```tsx
// src/components/clients/ClientList.tsx
export const ClientList: React.FC<ClientListProps> = ({
  view = 'table',
  onClientSelect,
  actions = [],
}) => {
  const [filters, setFilters] = useState<ClientFilters>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const { data, isLoading, error } = useClients({
    ...filters,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
  });
  
  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        size: 40,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <button
            className="text-left font-medium text-primary-600 hover:underline"
            onClick={() => onClientSelect?.(row.original)}
          >
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ getValue }) => (
          <span className="text-gray-600">{getValue()}</span>
        ),
      },
      {
        accessorKey: 'tier',
        header: 'Tier',
        cell: ({ getValue }) => (
          <TierBadge tier={getValue() as ClientTier} />
        ),
        filterFn: 'includesString',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => (
          <StatusBadge status={getValue() as ClientStatus} />
        ),
      },
      {
        accessorKey: 'upcomingTrips',
        header: 'Upcoming Trips',
        cell: ({ row }) => (
          <span className="text-center">
            {row.original.upcomingTripsCount || 0}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <ClientActions client={row.original} actions={actions} />
        ),
        size: 100,
      },
    ],
    [onClientSelect, actions]
  );
  
  const table = useReactTable({
    data: data?.data || [],
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection: selectedRows,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setSelectedRows,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  
  if (isLoading) return <ClientListSkeleton />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <div className="space-y-4">
      <ClientListHeader
        totalCount={data?.meta.total || 0}
        onSearch={(query) => setFilters({ ...filters, search: query })}
        onViewChange={setView}
        currentView={view}
      />
      
      <ClientFilters
        filters={filters}
        onChange={setFilters}
        clientCount={data?.meta.total || 0}
      />
      
      {selectedRows.size > 0 && (
        <BulkActions
          selectedCount={selectedRows.size}
          actions={actions}
          onAction={(action) => {
            const selectedClients = Array.from(selectedRows)
              .map(id => data?.data.find(c => c.id === id))
              .filter(Boolean) as Client[];
            action(selectedClients);
          }}
        />
      )}
      
      {view === 'table' ? (
        <ClientTable table={table} />
      ) : (
        <ClientCards clients={data?.data || []} />
      )}
      
      <Pagination
        currentPage={data?.meta.page || 1}
        totalPages={data?.meta.totalPages || 1}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  );
};
```

## Filter Component
```tsx
// src/components/clients/ClientFilters.tsx
export const ClientFilters: React.FC<ClientFiltersProps> = ({
  filters,
  onChange,
  clientCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <TierFilter
            value={filters.tier || []}
            onChange={(tier) => onChange({ ...filters, tier })}
          />
          
          <StatusFilter
            value={filters.status || []}
            onChange={(status) => onChange({ ...filters, status })}
          />
          
          <DateRangeFilter
            value={filters.dateRange}
            onChange={(dateRange) => onChange({ ...filters, dateRange })}
          />
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm text-primary-600 hover:underline"
        >
          {isOpen ? 'Hide' : 'Show'} Advanced Filters
          {activeFilterCount > 0 && ` (${activeFilterCount})`}
        </button>
      </div>
      
      {isOpen && (
        <AdvancedFilters
          filters={filters}
          onChange={onChange}
        />
      )}
      
      {activeFilterCount > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {clientCount} clients
          </span>
          <button
            onClick={() => onChange({})}
            className="text-sm text-red-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
```

## Card View
```tsx
const ClientCards: React.FC<{ clients: Client[] }> = ({ clients }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {clients.map((client) => (
      <ClientCard key={client.id} client={client} />
    ))}
  </div>
);

const ClientCard: React.FC<{ client: Client }> = ({ client }) => (
  <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="font-semibold text-lg">{client.name}</h3>
        <p className="text-gray-600">{client.email}</p>
      </div>
      <TierBadge tier={client.tier} />
    </div>
    
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Status</span>
        <StatusBadge status={client.status} />
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Upcoming Trips</span>
        <span>{client.upcomingTripsCount || 0}</span>
      </div>
    </div>
    
    <div className="mt-4 flex gap-2">
      <Button size="sm" variant="outline" className="flex-1">
        View Details
      </Button>
      <Button size="sm" variant="outline">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  </div>
);
```

## Acceptance Criteria
- [ ] List displays all clients
- [ ] Filtering works correctly
- [ ] Search updates in real-time
- [ ] Sorting functions properly
- [ ] Bulk actions execute
- [ ] View toggle works

## Where to Create
- `packages/web-dashboard/src/components/clients/ClientList.tsx`
- Sub-components in `src/components/clients/`
- Filters in `src/components/clients/filters/`

## Performance Requirements
- Render 1000+ rows smoothly
- Filter response < 100ms
- No layout shifts
- Smooth animations

## Estimated Effort
4 hours