# Task: Implement Real-time Updates

**ID:** CS-P4-015  
**Phase:** Web Dashboard  
**Dependencies:** CS-P1-004

## Objective
Create a comprehensive real-time update system using Supabase Realtime to synchronize data across dashboard sessions, providing live updates for client changes, trip modifications, and system events.

## Context
Multiple organizers may be working simultaneously in the dashboard. Real-time updates ensure all users see the latest data without manual refreshing, preventing conflicts and improving collaboration. The system must handle connection management, reconnection, and efficient data synchronization.

## Requirements
- WebSocket connection management
- Automatic reconnection handling
- Selective subscription management
- Optimistic UI updates
- Conflict resolution
- Presence tracking

## Technical Guidance
- Use Supabase Realtime channels
- Implement connection pooling
- Apply subscription lifecycle
- Handle network failures
- Create update queuing
- Monitor performance

## Real-time Service Architecture
```typescript
interface RealtimeService {
  // Connection management
  connect(): Promise<void>;
  disconnect(): void;
  getConnectionStatus(): ConnectionStatus;
  onConnectionChange(callback: (status: ConnectionStatus) => void): Unsubscribe;
  
  // Channel subscriptions
  subscribeToTable<T>(
    table: string,
    options?: SubscriptionOptions
  ): Observable<RealtimeEvent<T>>;
  
  subscribeToChannel(
    channel: string,
    events: ChannelEvents
  ): RealtimeChannel;
  
  // Presence
  trackPresence(channel: string, data: PresenceData): Promise<void>;
  getPresence(channel: string): Promise<Presence[]>;
  
  // Broadcasting
  broadcast(channel: string, event: string, payload: any): Promise<void>;
}

interface SubscriptionOptions {
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  schema?: string;
}

interface RealtimeEvent<T> {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  new: T | null;
  old: T | null;
  timestamp: Date;
}
```

## Real-time Context Provider
```tsx
// src/contexts/RealtimeContext.tsx
export const RealtimeProvider: React.FC<{ children: ReactNode }> = ({ 
  children 
}) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [subscriptions, setSubscriptions] = useState<Map<string, RealtimeChannel>>(new Map());
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Initialize connection
    const initRealtime = async () => {
      try {
        await realtimeService.connect();
        setConnectionStatus('connected');
        
        // Set up global subscriptions
        setupGlobalSubscriptions();
      } catch (error) {
        console.error('Failed to connect to realtime:', error);
        setConnectionStatus('error');
        
        // Retry connection
        setTimeout(initRealtime, 5000);
      }
    };
    
    initRealtime();
    
    // Monitor connection status
    const unsubscribe = realtimeService.onConnectionChange((status) => {
      setConnectionStatus(status);
      
      if (status === 'connected') {
        // Resubscribe to channels
        resubscribeAll();
      }
    });
    
    return () => {
      unsubscribe();
      realtimeService.disconnect();
    };
  }, []);
  
  const setupGlobalSubscriptions = () => {
    // Subscribe to client updates
    const clientSub = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        handleClientChange
      )
      .subscribe();
    
    // Subscribe to trip updates
    const tripSub = supabase
      .channel('trips-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trips' },
        handleTripChange
      )
      .subscribe();
    
    subscriptions.set('clients', clientSub);
    subscriptions.set('trips', tripSub);
  };
  
  const handleClientChange = (payload: RealtimePostgresChangesPayload<Client>) => {
    const event: RealtimeEvent<Client> = {
      type: payload.eventType,
      table: 'clients',
      schema: 'public',
      new: payload.new as Client,
      old: payload.old as Client,
      timestamp: new Date(),
    };
    
    // Update React Query cache
    switch (event.type) {
      case 'INSERT':
      case 'UPDATE':
        queryClient.setQueryData(
          ['client', event.new?.id],
          event.new
        );
        queryClient.invalidateQueries(['clients']);
        break;
        
      case 'DELETE':
        queryClient.removeQueries(['client', event.old?.id]);
        queryClient.invalidateQueries(['clients']);
        break;
    }
    
    // Show notification
    if (event.type === 'UPDATE' && event.new) {
      showUpdateNotification({
        title: 'Client Updated',
        message: `${event.new.name} was updated`,
        action: () => navigateToClient(event.new.id),
      });
    }
  };
  
  return (
    <RealtimeContext.Provider value={{
      connectionStatus,
      subscriptions,
      subscribe,
      unsubscribe,
      broadcast,
    }}>
      {children}
    </RealtimeContext.Provider>
  );
};
```

## Connection Status Indicator
```tsx
const ConnectionStatus: React.FC = () => {
  const { connectionStatus } = useRealtime();
  
  const statusConfig = {
    connected: {
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: Wifi,
      label: 'Connected',
    },
    connecting: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: WifiOff,
      label: 'Connecting...',
    },
    disconnected: {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: WifiOff,
      label: 'Disconnected',
    },
    error: {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: AlertCircle,
      label: 'Connection Error',
    },
  };
  
  const config = statusConfig[connectionStatus];
  
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1 rounded-full text-sm',
      config.bgColor,
      config.color
    )}>
      <config.icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
};
```

## Subscription Hook
```tsx
// src/hooks/useRealtimeSubscription.ts
export const useRealtimeSubscription = <T>(
  table: string,
  options?: UseRealtimeOptions<T>
) => {
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<RealtimeEvent<T>[]>([]);
  
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-subscription-${generateId()}`)
      .on(
        'postgres_changes',
        {
          event: options?.event || '*',
          schema: options?.schema || 'public',
          table,
          filter: options?.filter,
        },
        (payload) => {
          const event: RealtimeEvent<T> = {
            type: payload.eventType,
            table,
            schema: payload.schema,
            new: payload.new as T,
            old: payload.old as T,
            timestamp: new Date(),
          };
          
          // Call custom handler
          options?.onEvent?.(event);
          
          // Update local state
          setEvents((prev) => [...prev, event]);
          
          // Update React Query cache
          if (options?.updateCache) {
            updateQueryCache(queryClient, event, options.queryKey);
          }
        }
      )
      .subscribe();
    
    return () => {
      channel.unsubscribe();
    };
  }, [table, options]);
  
  return { events, lastEvent: events[events.length - 1] };
};

// Usage example
const ClientListRealtime = () => {
  const { data: clients } = useClients();
  
  useRealtimeSubscription('clients', {
    updateCache: true,
    queryKey: ['clients'],
    onEvent: (event) => {
      if (event.type === 'INSERT') {
        toast.success(`New client added: ${event.new?.name}`);
      }
    },
  });
  
  return <ClientList clients={clients} />;
};
```

## Presence Tracking
```tsx
const PresenceIndicator: React.FC<{ channelId: string }> = ({ channelId }) => {
  const [presence, setPresence] = useState<Presence[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    const channel = supabase.channel(channelId);
    
    // Track own presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setPresence(Object.values(state).flat());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            user_name: user.name,
            online_at: new Date().toISOString(),
          });
        }
      });
    
    return () => {
      channel.unsubscribe();
    };
  }, [channelId, user]);
  
  const otherUsers = presence.filter(p => p.user_id !== user.id);
  
  if (otherUsers.length === 0) return null;
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {otherUsers.slice(0, 3).map((user) => (
          <Avatar
            key={user.user_id}
            name={user.user_name}
            size="sm"
            className="ring-2 ring-white"
          />
        ))}
      </div>
      
      {otherUsers.length > 3 && (
        <span className="text-sm text-gray-500">
          +{otherUsers.length - 3} more
        </span>
      )}
      
      <Tooltip content="Other users viewing this page">
        <Info className="h-4 w-4 text-gray-400" />
      </Tooltip>
    </div>
  );
};
```

## Optimistic Updates with Conflict Resolution
```tsx
const useOptimisticUpdate = <T extends { id: string }>(
  table: string,
  queryKey: QueryKey
) => {
  const queryClient = useQueryClient();
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  
  const update = useMutation({
    mutationFn: async (data: Partial<T>) => {
      // Optimistically update cache
      const previousData = queryClient.getQueryData<T>(queryKey);
      queryClient.setQueryData(queryKey, { ...previousData, ...data });
      
      // Perform actual update
      const { data: updated, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', data.id)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      queryClient.setQueryData(queryKey, context?.previousData);
      
      // Check for conflict
      if (error.code === 'conflict') {
        setConflicts([...conflicts, {
          local: variables,
          remote: error.remoteData,
          field: error.conflictField,
        }]);
      }
    },
  });
  
  const resolveConflict = (conflictId: string, resolution: 'local' | 'remote') => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;
    
    if (resolution === 'local') {
      update.mutate(conflict.local);
    } else {
      queryClient.setQueryData(queryKey, conflict.remote);
    }
    
    setConflicts(conflicts.filter(c => c.id !== conflictId));
  };
  
  return {
    update: update.mutate,
    isUpdating: update.isLoading,
    conflicts,
    resolveConflict,
  };
};
```

## Broadcast Events
```tsx
const CollaborationCursor: React.FC = () => {
  const { user } = useAuth();
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  
  useEffect(() => {
    const channel = supabase.channel('collaboration-cursors');
    
    // Listen for cursor updates
    channel
      .on('broadcast', { event: 'cursor-move' }, (payload) => {
        setCursors((prev) => {
          const next = new Map(prev);
          next.set(payload.userId, payload.position);
          return next;
        });
      })
      .subscribe();
    
    // Broadcast own cursor
    const handleMouseMove = throttle((e: MouseEvent) => {
      channel.send({
        type: 'broadcast',
        event: 'cursor-move',
        payload: {
          userId: user.id,
          position: { x: e.clientX, y: e.clientY },
          userName: user.name,
        },
      });
    }, 50);
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      channel.unsubscribe();
    };
  }, [user]);
  
  return (
    <>
      {Array.from(cursors.entries()).map(([userId, position]) => (
        <div
          key={userId}
          className="fixed pointer-events-none z-50"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-4 h-4 bg-primary-500 rounded-full" />
          <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded">
            {position.userName}
          </span>
        </div>
      ))}
    </>
  );
};
```

## Performance Monitoring
```tsx
const RealtimeMetrics: React.FC = () => {
  const { metrics } = useRealtimeMetrics();
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard
        label="Latency"
        value={`${metrics.avgLatency}ms`}
        trend={metrics.latencyTrend}
      />
      
      <MetricCard
        label="Messages/sec"
        value={metrics.messageRate}
        trend={metrics.messageRateTrend}
      />
      
      <MetricCard
        label="Active Subscriptions"
        value={metrics.activeSubscriptions}
      />
      
      <MetricCard
        label="Connection Uptime"
        value={`${metrics.uptime}%`}
      />
    </div>
  );
};
```

## Acceptance Criteria
- [ ] Real-time updates work reliably
- [ ] Reconnection handles gracefully
- [ ] Presence tracking functions
- [ ] Optimistic updates resolve conflicts
- [ ] Performance remains optimal
- [ ] Broadcasting works correctly

## Where to Create
- `packages/web-dashboard/src/contexts/RealtimeContext.tsx`
- `packages/web-dashboard/src/hooks/useRealtime.ts`
- `packages/web-dashboard/src/services/realtimeService.ts`

## Performance Requirements
- Update latency < 200ms
- Handle 100+ concurrent users
- Reconnection time < 2s
- Memory usage stable
- CPU usage < 5%

## Estimated Effort
4 hours