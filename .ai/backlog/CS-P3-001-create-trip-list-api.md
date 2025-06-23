# Task: Create Trip List API Service Layer

**ID:** CS-P3-001  
**Phase:** Trip Management  
**Dependencies:** CS-P1-004, CS-P2-014

## Objective
Implement a comprehensive API service layer for trip management using repository pattern, including data fetching, caching, real-time updates, and offline support.

## Context
The trip list is the core feature of the mobile app, requiring performant data fetching with intelligent caching and real-time synchronization. The service layer must handle complex trip data while providing a smooth user experience even in poor network conditions.

## Requirements
- Repository pattern implementation for trips
- Intelligent caching with React Query
- Real-time subscription for trip updates
- Offline-first architecture
- Pagination for large trip lists
- Filter and sort capabilities

## Technical Guidance
- Implement repository pattern with Supabase
- Use React Query for cache management
- Apply real-time subscriptions
- Store offline data in AsyncStorage
- Implement cursor-based pagination
- Create TypeScript interfaces

## Service Architecture
```typescript
interface TripRepository {
  // Query methods
  getTrips(filters: TripFilters): Promise<PaginatedTrips>;
  getTripById(id: string): Promise<Trip>;
  getUpcomingTrips(limit: number): Promise<Trip[]>;
  getPastTrips(limit: number): Promise<Trip[]>;
  
  // Real-time
  subscribeToTrips(callback: (trip: Trip) => void): Unsubscribe;
  subscribeToTripUpdates(tripId: string, callback: (trip: Trip) => void): Unsubscribe;
  
  // Cache management
  invalidateTrip(id: string): Promise<void>;
  prefetchTrip(id: string): Promise<void>;
}

interface TripFilters {
  status?: TripStatus[];
  dateRange?: { start: Date; end: Date };
  destination?: string;
  sortBy?: 'date' | 'created' | 'modified';
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedTrips {
  data: Trip[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}
```

## Data Model
```typescript
interface Trip {
  id: string;
  clientId: string;
  status: TripStatus;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  segments: TripSegment[];
  totalCost: Money;
  createdAt: Date;
  updatedAt: Date;
  metadata: TripMetadata;
}

type TripStatus = 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
```

## Caching Strategy
- Cache trips for 5 minutes
- Prefetch next page on scroll
- Invalidate on mutations
- Background sync when online
- Persist cache to AsyncStorage
- Smart cache warming

## Real-time Features
- New trip notifications
- Status change updates
- Itinerary modifications
- Cost updates
- Document uploads

## Acceptance Criteria
- [ ] API calls complete in < 500ms
- [ ] Offline mode works seamlessly
- [ ] Real-time updates apply instantly
- [ ] Pagination handles 1000+ trips
- [ ] Type safety throughout
- [ ] Error handling is comprehensive

## Where to Create
- `packages/mobile-app/src/services/trips/tripRepository.ts`
- `packages/mobile-app/src/hooks/useTrips.ts`
- `packages/shared/src/types/trip.ts`

## Performance Metrics
- Initial load time < 1s
- Subsequent loads < 200ms
- Real-time latency < 100ms
- Memory usage < 50MB

## Estimated Effort
3 hours