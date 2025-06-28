# Task: Create Client Detail Page

**ID:** CS-P4-010  
**Phase:** Web Dashboard  
**Dependencies:** CS-P4-007, CS-P4-011

## Objective
Build a comprehensive client detail page that displays all client information, preferences, trip history, and provides management actions in an organized, accessible interface.

## Context
The client detail page is where organizers deep-dive into individual client information to understand their needs and manage their account. It must present complex data in digestible sections while supporting various administrative actions.

## Requirements
- Complete client profile display
- Preference summary sections
- Trip history timeline
- Document management
- Activity audit log
- Quick action toolbar

## Technical Guidance
- Use tab-based navigation
- Implement data loaders
- Apply optimistic updates
- Create reusable sections
- Handle loading states
- Support deep linking

## Page Architecture
```typescript
interface ClientDetailPageProps {
  clientId: string;
}

interface ClientDetailSections {
  overview: ClientOverview;
  preferences: ClientPreferences;
  trips: ClientTrips;
  documents: ClientDocuments;
  activity: ClientActivity;
  notes: ClientNotes;
}

interface ClientActions {
  editProfile: () => void;
  updateTier: (tier: ClientTier) => void;
  sendMessage: () => void;
  exportData: () => void;
  archiveClient: () => void;
}
```

## Visual Layout
```
┌─────────────────────────────────────────────┐
│ < Back to Clients                           │
├─────────────────────────────────────────────┤
│ ┌───┐                                       │
│ │IMG│ John Doe                    [Actions] │
│ └───┘ john.doe@email.com                   │
│       ⭐ Platinum Member • Active           │
├─────────────────────────────────────────────┤
│ Overview | Preferences | Trips | Documents  │
├─────────────────────────────────────────────┤
│                                             │
│ [Tab Content Area]                          │
│                                             │
└─────────────────────────────────────────────┘
```

## Route Loader
```typescript
// src/routes/loaders/clientDetailLoader.ts
export const clientDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  const { clientId } = params;
  
  if (!clientId) {
    throw new Response('Client ID required', { status: 400 });
  }
  
  try {
    const [client, preferences, recentTrips] = await Promise.all([
      clientService.getClientById(clientId),
      clientService.getClientPreferences(clientId),
      tripService.getClientTrips(clientId, { limit: 5 }),
    ]);
    
    return { client, preferences, recentTrips };
  } catch (error) {
    throw new Response('Client not found', { status: 404 });
  }
};
```

## Main Component
```tsx
// src/pages/clients/ClientDetailPage.tsx
export const ClientDetailPage: React.FC = () => {
  const { client, preferences, recentTrips } = useLoaderData();
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  
  const { hasPermission } = usePermissions();
  const updateTierMutation = useUpdateClientTier();
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'trips', label: 'Trips', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
  ];
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <button
            onClick={() => navigate('/dashboard/clients')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Clients
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                src={client.avatar}
                name={client.name}
                size="lg"
              />
              
              <div>
                <h1 className="text-2xl font-bold">{client.name}</h1>
                <p className="text-gray-600">{client.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <TierBadge tier={client.tier} />
                  <StatusBadge status={client.status} />
                  <span className="text-sm text-gray-500">
                    Member since {formatDate(client.joinedAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <ClientActions client={client} />
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-t">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <TabContent
          activeTab={activeTab}
          client={client}
          preferences={preferences}
          recentTrips={recentTrips}
        />
      </div>
    </div>
  );
};
```

## Tab Components

### Overview Tab
```tsx
const OverviewTab: React.FC<{ client: Client }> = ({ client }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <QuickStats client={client} />
      <RecentActivity clientId={client.id} limit={10} />
      <UpcomingTrips clientId={client.id} />
    </div>
    
    <div className="space-y-6">
      <ContactInformation client={client} />
      <EmergencyContact contact={client.emergencyContact} />
      <ClientTags client={client} />
    </div>
  </div>
);
```

### Preferences Tab
```tsx
const PreferencesTab: React.FC<{ preferences: ClientPreferences }> = ({ 
  preferences 
}) => (
  <div className="space-y-6">
    <PreferenceSection
      title="Flight Preferences"
      icon={Plane}
      preferences={preferences.flight}
      editPath="/dashboard/clients/:id/preferences/flight"
    />
    
    <PreferenceSection
      title="Hotel Preferences"
      icon={Hotel}
      preferences={preferences.hotel}
      editPath="/dashboard/clients/:id/preferences/hotel"
    />
    
    <PreferenceSection
      title="Activity Preferences"
      icon={Activity}
      preferences={preferences.activities}
      editPath="/dashboard/clients/:id/preferences/activities"
    />
    
    <PreferenceSection
      title="Dining Preferences"
      icon={Utensils}
      preferences={preferences.dining}
      editPath="/dashboard/clients/:id/preferences/dining"
    />
  </div>
);
```

### Activity Log Tab
```tsx
const ActivityTab: React.FC<{ clientId: string }> = ({ clientId }) => {
  const { data: activities, isLoading } = useClientActivity(clientId);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Activity History</h3>
        <Select defaultValue="all">
          <option value="all">All Activities</option>
          <option value="profile">Profile Changes</option>
          <option value="trips">Trip Activities</option>
          <option value="preferences">Preference Updates</option>
        </Select>
      </div>
      
      <Timeline>
        {activities?.map((activity) => (
          <TimelineItem
            key={activity.id}
            timestamp={activity.timestamp}
            user={activity.user}
            action={activity.action}
            details={activity.details}
          />
        ))}
      </Timeline>
    </div>
  );
};
```

## Client Actions Menu
```tsx
const ClientActions: React.FC<{ client: Client }> = ({ client }) => {
  const { hasPermission } = usePermissions();
  
  const actions = [
    {
      label: 'Edit Profile',
      icon: Edit,
      onClick: () => navigate(`/dashboard/clients/${client.id}/edit`),
      permission: Permission.EDIT_CLIENTS,
    },
    {
      label: 'Update Tier',
      icon: Star,
      onClick: () => openTierModal(client),
      permission: Permission.EDIT_CLIENTS,
    },
    {
      label: 'Send Message',
      icon: Mail,
      onClick: () => openMessageModal(client),
    },
    {
      label: 'Export Data',
      icon: Download,
      onClick: () => exportClientData(client.id),
    },
    {
      label: 'Archive',
      icon: Archive,
      onClick: () => confirmArchive(client),
      permission: Permission.DELETE_CLIENTS,
      danger: true,
    },
  ];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Actions <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {actions.map((action) => (
          <CanAccess key={action.label} permissions={[action.permission]}>
            <DropdownMenuItem
              onClick={action.onClick}
              className={action.danger ? 'text-red-600' : ''}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          </CanAccess>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

## Acceptance Criteria
- [ ] Client data loads completely
- [ ] All tabs display correctly
- [ ] Actions require permissions
- [ ] Updates reflect immediately
- [ ] Navigation works properly
- [ ] Export functionality works

## Where to Create
- `packages/web-dashboard/src/pages/clients/ClientDetailPage.tsx`
- Tab components in `src/components/client-detail/`
- Actions in `src/components/client-detail/ClientActions.tsx`

## Performance Considerations
- Lazy load tab content
- Cache client data
- Optimize activity queries
- Virtualize long lists
- Prefetch related data

## Estimated Effort
4 hours