# Task: Create Profile Screen

**ID:** CS-P3-006  
**Phase:** Trip Management  
**Dependencies:** CS-P2-014, CS-P3-007

## Objective
Build a comprehensive profile screen that displays user information, preferences summary, and provides navigation to edit specific preference categories.

## Context
The profile screen serves as the central hub for users to review and manage their personal information and travel preferences. It must present complex preference data in a digestible format while providing easy access to modification flows.

## Requirements
- Display personal information
- Show preference summaries
- Navigation to edit screens
- Account settings section
- Tier status display
- Support and help links

## Technical Guidance
- Update existing tab screen
- Use ScrollView for content
- Implement section components
- Apply consistent styling
- Handle deep linking
- Support pull-to-refresh

## Screen Structure
```typescript
interface ProfileScreenSections {
  header: {
    name: string;
    email: string;
    memberSince: Date;
    tier: ClientTier;
    avatar?: string;
  };
  preferences: {
    flight: PreferenceSummary;
    hotel: PreferenceSummary;
    activities: PreferenceSummary;
    dining: PreferenceSummary;
  };
  account: {
    settings: AccountSettings;
    security: SecuritySettings;
    notifications: NotificationSettings;
  };
  support: {
    help: HelpLink[];
    contact: ContactOptions;
    about: AppInfo;
  };
}
```

## UI Layout
```
┌─────────────────────────────────┐
│ Profile            [Settings]   │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │    [Avatar]                 │ │
│ │    John Doe                 │ │
│ │    ⭐ Platinum Member       │ │
│ │    Member since 2022        │ │
│ └─────────────────────────────┘ │
│                                 │
│ TRAVEL PREFERENCES              │
│ ┌─────────────────────────────┐ │
│ │ ✈️ Flights              [>] │ │
│ │ Business class, Aisle seat │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 🏨 Hotels               [>] │ │
│ │ 5-star, King bed          │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 🎯 Activities           [>] │ │
│ │ Cultural, Moderate pace   │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 🍽️ Dining              [>] │ │
│ │ Vegetarian, Fine dining   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ACCOUNT                         │
│ ┌─────────────────────────────┐ │
│ │ Notifications          [>] │ │
│ │ Privacy & Security     [>] │ │
│ │ Help & Support         [>] │ │
│ │ Sign Out                  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Component Implementation
```typescript
const ProfileScreen = () => {
  const { viewer } = useViewerContext();
  const { data: preferences } = useUserPreferences();
  
  const sections = [
    {
      title: 'Travel Preferences',
      items: [
        {
          icon: '✈️',
          title: 'Flights',
          summary: getFlightSummary(preferences?.flight),
          onPress: () => router.push('/profile/edit/flights')
        },
        // ... other preferences
      ]
    },
    {
      title: 'Account',
      items: [
        {
          title: 'Notifications',
          onPress: () => router.push('/profile/notifications')
        },
        // ... other settings
      ]
    }
  ];
  
  return (
    <ScrollView>
      <ProfileHeader user={viewer} />
      {sections.map(section => (
        <Section key={section.title} {...section} />
      ))}
    </ScrollView>
  );
};
```

## Features
- **Tier Badge**: Visual tier indicator
- **Quick Stats**: Trip count, member duration
- **Preference Summary**: Key preferences shown
- **Deep Links**: Direct edit navigation
- **Sign Out**: Secure logout flow
- **Help**: In-app support options

## Acceptance Criteria
- [ ] Profile data loads correctly
- [ ] Navigation to edit screens works
- [ ] Preference summaries are accurate
- [ ] Tier status displays properly
- [ ] Sign out clears all data
- [ ] Pull-to-refresh updates data

## Where to Create
- `packages/mobile-app/src/app/(app)/(tabs)/two.tsx` (update existing)
- Components in `src/components/profile/`
- Edit screens in `src/app/(app)/profile/edit/`

## Security Considerations
- Mask sensitive information
- Secure logout implementation
- Clear cache on sign out
- Audit log profile access

## Estimated Effort
2 hours