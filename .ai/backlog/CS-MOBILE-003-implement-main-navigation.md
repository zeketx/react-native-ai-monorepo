# CS-MOBILE-003: Implement Main App Navigation

## Priority
P1 - Core Feature

## Status
PENDING

## Description
Set up the main navigation structure for the mobile app after login, including bottom tab navigation, stack navigators for each section, and proper navigation flow between screens.

## Acceptance Criteria
- [ ] Implement bottom tab navigation with icons
- [ ] Create stack navigators for each tab section
- [ ] Add trip list and trip detail screens
- [ ] Add profile and settings screens
- [ ] Implement proper back navigation
- [ ] Add deep linking support
- [ ] Handle navigation state persistence
- [ ] Add screen transition animations

## Technical Details

### Navigation Structure:
```
Bottom Tabs:
├── Trips (Stack)
│   ├── TripList
│   ├── TripDetails
│   └── TripItinerary
├── Profile (Stack)
│   ├── ProfileView
│   ├── EditProfile
│   └── Preferences
└── Settings (Stack)
    ├── SettingsList
    ├── Notifications
    └── Privacy

Modal Screens:
├── AddTrip
├── Support
└── About
```

### Implementation:
```typescript
// src/navigation/AppNavigator.tsx
const TripsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="TripList" component={TripListScreen} />
    <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
    <Stack.Screen name="TripItinerary" component={TripItineraryScreen} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen 
      name="Trips" 
      component={TripsStack}
      options={{
        tabBarIcon: ({ color }) => <Icon name="airplane" color={color} />
      }}
    />
    <Tab.Screen name="Profile" component={ProfileStack} />
    <Tab.Screen name="Settings" component={SettingsStack} />
  </Tab.Navigator>
);
```

### Deep Linking Config:
```typescript
const linking = {
  prefixes: ['clientsync://', 'https://app.clientsync.com'],
  config: {
    screens: {
      Trips: {
        screens: {
          TripDetails: 'trip/:id',
        },
      },
    },
  },
};
```

## Dependencies
- React Navigation v6
- CS-MOBILE-002 (Login must be implemented)
- React Native Vector Icons

## Notes
- Follow iOS and Android navigation patterns
- Ensure smooth transitions between screens
- Handle navigation during loading states
- Test on both platforms for native feel