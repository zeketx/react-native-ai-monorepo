# Task: Add Pull-to-Refresh Functionality

**ID:** CS-P3-008  
**Phase:** Trip Management  
**Dependencies:** CS-P3-003, CS-P3-001

## Objective
Implement pull-to-refresh functionality across all list screens with proper loading states, haptic feedback, and optimized data fetching strategies.

## Context
Pull-to-refresh is an expected mobile UX pattern that allows users to manually refresh content. Implementation must feel native on both iOS and Android while efficiently updating data and providing appropriate feedback.

## Requirements
- Native feel on iOS and Android
- Haptic feedback on trigger
- Loading states during refresh
- Smart data invalidation
- Error handling
- Prevent multiple simultaneous refreshes

## Technical Guidance
- Use RefreshControl component
- Implement with React Query
- Add platform-specific styling
- Apply haptic feedback API
- Handle race conditions
- Optimize refetch strategies

## Implementation Strategy
```typescript
interface RefreshableListProps {
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  children: React.ReactNode;
  scrollComponent?: 'FlatList' | 'ScrollView';
}

const useRefreshableData = (queryKey: string[]) => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await queryClient.invalidateQueries(queryKey);
      await queryClient.refetchQueries(queryKey);
    } catch (error) {
      Toast.show('Failed to refresh', { type: 'error' });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryKey, isRefreshing]);
  
  return { isRefreshing, handleRefresh };
};
```

## Screen Implementations

### Trip List Screen
```typescript
const TripListScreen = () => {
  const { isRefreshing, handleRefresh } = useRefreshableData(['trips']);
  
  return (
    <FlatList
      data={trips}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          title="Pull to refresh"
          titleColor={colors.text}
        />
      }
      renderItem={renderTripCard}
    />
  );
};
```

### Profile Screen
- Refresh user data
- Update preferences
- Sync tier status

### Trip Detail Screen
- Refresh trip details
- Update documents
- Sync real-time changes

## Platform Specifics
```typescript
const refreshControlProps = Platform.select({
  ios: {
    tintColor: colors.primary,
    title: isRefreshing ? 'Refreshing...' : 'Pull to refresh',
    titleColor: colors.textSecondary
  },
  android: {
    colors: [colors.primary, colors.secondary],
    progressBackgroundColor: colors.background
  }
});
```

## Data Refresh Strategy
1. Invalidate stale queries
2. Refetch active queries
3. Update related caches
4. Preserve scroll position
5. Show success feedback

## Error Handling
- Network errors: Show toast
- Partial failures: Update what's possible
- Timeout: Cancel and notify
- Retry logic: Exponential backoff

## Acceptance Criteria
- [ ] Pull gesture feels native
- [ ] Haptic feedback works
- [ ] Loading states display
- [ ] Data updates correctly
- [ ] Errors handled gracefully
- [ ] No duplicate requests

## Where to Create
- Hook in `packages/mobile-app/src/hooks/useRefreshable.ts`
- Component in `src/components/common/RefreshableList.tsx`
- Update screens in respective locations

## Performance Metrics
- Refresh trigger: < 50ms
- Data fetch: < 2s typical
- UI update: < 16ms
- No memory leaks

## Estimated Effort
1.5 hours