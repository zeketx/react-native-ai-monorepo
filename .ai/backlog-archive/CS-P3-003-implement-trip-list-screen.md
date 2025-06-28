# Task: Implement Trip List Screen

**ID:** CS-P3-003  
**Phase:** Trip Management  
**Dependencies:** CS-P3-001, CS-P3-002

## Objective
Build the main trip list screen that displays all client trips with filtering, sorting, and search capabilities, serving as the primary navigation hub of the mobile app.

## Context
The trip list screen is the home screen of the app post-login, where clients view all their trips. It must handle various states (empty, loading, error) while providing intuitive filtering and navigation to enhance the user experience.

## Requirements
- Sectioned list (upcoming, past trips)
- Filter by status, date, destination
- Search functionality
- Pull-to-refresh
- Empty state handling
- Infinite scroll pagination

## Technical Guidance
- Use FlatList with sections
- Implement React Query hooks
- Apply optimistic UI updates
- Use Reanimated for animations
- Handle offline gracefully
- Implement proper memoization

## Screen Architecture
```typescript
interface TripListScreenState {
  trips: GroupedTrips;
  filters: TripFilters;
  searchQuery: string;
  isRefreshing: boolean;
  isLoadingMore: boolean;
}

interface GroupedTrips {
  upcoming: Trip[];
  current: Trip[];
  past: Trip[];
}

interface ScreenActions {
  onFilterChange: (filters: TripFilters) => void;
  onSearch: (query: string) => void;
  onRefresh: () => Promise<void>;
  onLoadMore: () => Promise<void>;
  onTripPress: (trip: Trip) => void;
}
```

## UI Layout
```
┌─────────────────────────────────┐
│ ClientSync         [+] [Avatar] │
├─────────────────────────────────┤
│ [Search Bar]                    │
│ [Quick Filters: All|Upcoming|Past]
├─────────────────────────────────┤
│ CURRENT TRIP                    │
│ ┌─────────────────────────────┐ │
│ │ [Active Trip Card]          │ │
│ └─────────────────────────────┘ │
│                                 │
│ UPCOMING                        │
│ ┌─────────────────────────────┐ │
│ │ [Trip Card 1]               │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ [Trip Card 2]               │ │
│ └─────────────────────────────┘ │
│                                 │
│ PAST TRIPS                      │
│ ┌─────────────────────────────┐ │
│ │ [Trip Card 3]               │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Features Implementation
- **Search**: Debounced local search
- **Filters**: Bottom sheet with options
- **Refresh**: Haptic feedback on pull
- **Empty States**: Contextual messages
- **Loading**: Skeleton placeholders
- **Errors**: Retry mechanisms

## State Management
```typescript
const useTripListScreen = () => {
  const { data, isLoading, refetch } = useTrips(filters);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const filteredTrips = useMemo(() => 
    filterTrips(data, debouncedSearch), 
    [data, debouncedSearch]
  );
  
  return {
    trips: groupTripsByStatus(filteredTrips),
    handlers: { onSearch, onFilter, onRefresh }
  };
};
```

## Acceptance Criteria
- [ ] Trips load and display correctly
- [ ] Search filters results instantly
- [ ] Pull-to-refresh works smoothly
- [ ] Empty states are helpful
- [ ] Navigation to details works
- [ ] Performance: <16ms renders

## Where to Create
- `packages/mobile-app/src/app/(app)/(tabs)/index.tsx`
- Hooks in `src/hooks/useTripList.ts`
- Utilities in `src/utils/tripFilters.ts`

## Analytics Events
- Screen view with trip count
- Filter usage patterns
- Search query tracking
- Trip card interactions

## Estimated Effort
2.5 hours