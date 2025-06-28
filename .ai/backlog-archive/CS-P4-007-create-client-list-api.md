# Task: Create Client List API Service

**ID:** CS-P4-007  
**Phase:** Web Dashboard  
**Dependencies:** CS-P1-004, CS-P4-005

## Objective
Build a comprehensive API service layer for client management with advanced filtering, sorting, pagination, and real-time updates using Supabase and React Query.

## Context
The client list is the core feature of the dashboard, requiring performant data fetching with complex filtering capabilities. The service must handle large datasets efficiently while providing real-time updates when client data changes.

## Requirements
- Advanced filtering and search
- Server-side pagination
- Real-time subscriptions
- Bulk operations support
- Export functionality
- Caching and optimization

## Technical Guidance
- Implement repository pattern
- Use React Query for caching
- Apply cursor-based pagination
- Create TypeScript types
- Handle optimistic updates
- Build filter query builder

## API Service Architecture
```typescript
// src/services/clients/clientService.ts
interface ClientService {
  // Query operations
  getClients(params: ClientQueryParams): Promise<PaginatedResponse<Client>>;
  getClientById(id: string): Promise<Client>;
  searchClients(query: string): Promise<Client[]>;
  
  // Mutations
  updateClient(id: string, data: UpdateClientDto): Promise<Client>;
  updateClientTier(id: string, tier: ClientTier): Promise<Client>;
  bulkUpdateClients(updates: BulkUpdateDto[]): Promise<BulkUpdateResult>;
  
  // Real-time
  subscribeToClients(callback: (event: ClientEvent) => void): Unsubscribe;
  subscribeToClient(id: string, callback: (client: Client) => void): Unsubscribe;
  
  // Export
  exportClients(params: ClientQueryParams, format: 'csv' | 'xlsx'): Promise<Blob>;
}

interface ClientQueryParams {
  // Pagination
  page?: number;
  pageSize?: number;
  cursor?: string;
  
  // Filtering
  search?: string;
  tier?: ClientTier[];
  status?: ClientStatus[];
  hasUpcomingTrips?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  
  // Sorting
  sortBy?: ClientSortField;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
  };
}
```

## Query Implementation
```typescript
export class ClientServiceImpl implements ClientService {
  async getClients(params: ClientQueryParams): Promise<PaginatedResponse<Client>> {
    const {
      page = 1,
      pageSize = 20,
      search,
      tier,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;
    
    let query = supabase
      .from('clients')
      .select('*, trips(count)', { count: 'exact' });
    
    // Apply search
    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        email.ilike.%${search}%
      `);
    }
    
    // Apply filters
    if (tier?.length) {
      query = query.in('tier', tier);
    }
    
    if (status?.length) {
      query = query.in('status', status);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: data || [],
      meta: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
        hasNextPage: to < (count || 0) - 1,
        hasPreviousPage: from > 0,
      },
    };
  }
  
  subscribeToClients(callback: (event: ClientEvent) => void): Unsubscribe {
    const subscription = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
        },
        (payload) => {
          callback({
            type: payload.eventType,
            client: payload.new as Client,
            oldClient: payload.old as Client,
          });
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }
}
```

## React Query Integration
```typescript
// src/hooks/useClients.ts
export const useClients = (params: ClientQueryParams) => {
  const queryKey = ['clients', params];
  
  return useQuery({
    queryKey,
    queryFn: () => clientService.getClients(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useClientSubscription = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = clientService.subscribeToClients((event) => {
      // Update cache based on event
      queryClient.invalidateQueries(['clients']);
      
      // Update individual client cache
      if (event.type === 'UPDATE' || event.type === 'INSERT') {
        queryClient.setQueryData(
          ['client', event.client.id],
          event.client
        );
      }
    });
    
    return unsubscribe;
  }, [queryClient]);
};
```

## Filter Builder
```typescript
// src/utils/clientFilterBuilder.ts
export class ClientFilterBuilder {
  private filters: Record<string, any> = {};
  
  search(query: string): this {
    if (query) {
      this.filters.search = query;
    }
    return this;
  }
  
  byTier(tiers: ClientTier[]): this {
    if (tiers.length > 0) {
      this.filters.tier = tiers;
    }
    return this;
  }
  
  byStatus(statuses: ClientStatus[]): this {
    if (statuses.length > 0) {
      this.filters.status = statuses;
    }
    return this;
  }
  
  withUpcomingTrips(): this {
    this.filters.hasUpcomingTrips = true;
    return this;
  }
  
  build(): ClientQueryParams {
    return this.filters;
  }
}
```

## Bulk Operations
```typescript
export const useBulkUpdateClients = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: BulkUpdateDto[]) => 
      clientService.bulkUpdateClients(updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      toast.success('Clients updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update clients');
    },
  });
};
```

## Export Functionality
```typescript
async exportClients(params: ClientQueryParams, format: 'csv' | 'xlsx'): Promise<Blob> {
  // Fetch all data without pagination
  const allClients = await this.getAllClients(params);
  
  if (format === 'csv') {
    return this.exportAsCSV(allClients);
  } else {
    return this.exportAsExcel(allClients);
  }
}

private exportAsCSV(clients: Client[]): Blob {
  const headers = ['Name', 'Email', 'Tier', 'Status', 'Join Date'];
  const rows = clients.map(client => [
    client.name,
    client.email,
    client.tier,
    client.status,
    formatDate(client.createdAt),
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return new Blob([csv], { type: 'text/csv' });
}
```

## Acceptance Criteria
- [ ] API fetches clients with filters
- [ ] Pagination works correctly
- [ ] Real-time updates apply
- [ ] Search returns relevant results
- [ ] Bulk operations succeed
- [ ] Export generates valid files

## Where to Create
- `packages/web-dashboard/src/services/clients/`
- `packages/web-dashboard/src/hooks/useClients.ts`
- `packages/shared/src/types/client.ts`

## Performance Optimization
- Index database columns
- Implement query debouncing
- Use virtual scrolling for large lists
- Cache frequent queries
- Optimize real-time subscriptions

## Estimated Effort
3.5 hours