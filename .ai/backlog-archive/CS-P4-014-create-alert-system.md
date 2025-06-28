# Task: Create Alert System

**ID:** CS-P4-014  
**Phase:** Web Dashboard  
**Dependencies:** CS-P4-015

## Objective
Build a comprehensive alert and notification system that monitors critical events, sends real-time notifications to organizers, and provides actionable insights for timely intervention.

## Context
Travel organizers need immediate awareness of important events such as unconfirmed bookings, client issues, system problems, and approaching deadlines. The alert system must prioritize notifications, support multiple delivery channels, and provide clear actions for resolution.

## Requirements
- Real-time alert generation
- Priority-based notifications
- Multiple delivery channels
- Alert aggregation and deduplication
- Snooze and acknowledgment
- Alert history and analytics

## Technical Guidance
- Use Supabase real-time subscriptions
- Implement WebSocket connections
- Apply notification queue
- Create alert rules engine
- Store alert preferences
- Track alert metrics

## Alert System Architecture
```typescript
interface AlertSystem {
  // Alert management
  createAlert(alert: CreateAlertDto): Promise<Alert>;
  getAlerts(filters: AlertFilters): Promise<Alert[]>;
  acknowledgeAlert(alertId: string): Promise<void>;
  snoozeAlert(alertId: string, until: Date): Promise<void>;
  
  // Subscriptions
  subscribeToAlerts(callback: (alert: Alert) => void): Unsubscribe;
  subscribeToAlertType(type: AlertType, callback: (alert: Alert) => void): Unsubscribe;
  
  // Rules engine
  createAlertRule(rule: AlertRule): Promise<void>;
  evaluateRules(event: SystemEvent): Promise<Alert[]>;
  
  // Delivery
  sendNotification(alert: Alert, channels: NotificationChannel[]): Promise<void>;
  getDeliveryStatus(alertId: string): Promise<DeliveryStatus>;
}

interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  data: Record<string, any>;
  source: AlertSource;
  status: AlertStatus;
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  snoozedUntil?: Date;
  actions?: AlertAction[];
}

enum AlertType {
  BOOKING_UNCONFIRMED = 'booking_unconfirmed',
  TRIP_APPROACHING = 'trip_approaching',
  CLIENT_ISSUE = 'client_issue',
  PAYMENT_OVERDUE = 'payment_overdue',
  DOCUMENT_MISSING = 'document_missing',
  SYSTEM_ERROR = 'system_error',
}

enum AlertPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}
```

## Alert Center Component
```tsx
// src/components/alerts/AlertCenter.tsx
export const AlertCenter: React.FC = () => {
  const [filter, setFilter] = useState<AlertFilter>({ status: 'active' });
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  
  const { data: alerts, refetch } = useAlerts(filter);
  const { mutate: acknowledgeAlert } = useAcknowledgeAlert();
  
  // Real-time subscription
  useAlertSubscription((newAlert) => {
    // Show notification
    showNotification(newAlert);
    // Refresh list
    refetch();
  });
  
  const groupedAlerts = useMemo(() => {
    return groupAlertsByPriority(alerts || []);
  }, [alerts]);
  
  return (
    <div className="flex h-full">
      {/* Alert List */}
      <div className="w-96 border-r bg-gray-50 overflow-y-auto">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold">Alerts</h2>
          <AlertFilters
            filter={filter}
            onChange={setFilter}
            counts={getAlertCounts(alerts)}
          />
        </div>
        
        <div className="divide-y divide-gray-200">
          {Object.entries(groupedAlerts).map(([priority, priorityAlerts]) => (
            <AlertGroup
              key={priority}
              priority={priority as AlertPriority}
              alerts={priorityAlerts}
              selectedId={selectedAlert?.id}
              onSelect={setSelectedAlert}
            />
          ))}
        </div>
      </div>
      
      {/* Alert Detail */}
      <div className="flex-1 bg-white">
        {selectedAlert ? (
          <AlertDetail
            alert={selectedAlert}
            onAcknowledge={() => {
              acknowledgeAlert(selectedAlert.id);
              setSelectedAlert(null);
            }}
            onSnooze={(until) => snoozeAlert(selectedAlert.id, until)}
          />
        ) : (
          <EmptyState
            icon={Bell}
            title="Select an alert"
            description="Choose an alert from the list to view details"
          />
        )}
      </div>
    </div>
  );
};
```

## Alert List Item
```tsx
const AlertListItem: React.FC<AlertListItemProps> = ({
  alert,
  isSelected,
  onSelect,
}) => {
  const priorityColors = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-gray-300 bg-gray-50',
  };
  
  return (
    <button
      onClick={() => onSelect(alert)}
      className={cn(
        'w-full p-4 text-left transition-colors border-l-4',
        priorityColors[alert.priority],
        isSelected && 'bg-primary-50 border-primary-500',
        'hover:bg-gray-100'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <AlertIcon type={alert.type} />
            <span className="text-sm font-medium truncate">
              {alert.title}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {alert.message}
          </p>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>{formatRelativeTime(alert.createdAt)}</span>
            {alert.source && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {alert.source}
              </span>
            )}
          </div>
        </div>
        
        {alert.status === 'acknowledged' && (
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        )}
      </div>
    </button>
  );
};
```

## Alert Detail View
```tsx
const AlertDetail: React.FC<AlertDetailProps> = ({
  alert,
  onAcknowledge,
  onSnooze,
}) => {
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <AlertIcon type={alert.type} size="lg" />
              <div>
                <h3 className="text-xl font-semibold">{alert.title}</h3>
                <p className="text-sm text-gray-500">
                  {formatDateTime(alert.createdAt)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <PriorityBadge priority={alert.priority} />
            
            {alert.status !== 'acknowledged' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Snooze
                </Button>
                
                <Button
                  size="sm"
                  onClick={onAcknowledge}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Acknowledge
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-gray-600">{alert.message}</p>
          </div>
          
          {alert.data && (
            <AlertData data={alert.data} type={alert.type} />
          )}
          
          {alert.actions && alert.actions.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Actions</h4>
              <div className="space-y-2">
                {alert.actions.map((action) => (
                  <AlertAction
                    key={action.id}
                    action={action}
                    alertId={alert.id}
                  />
                ))}
              </div>
            </div>
          )}
          
          {alert.acknowledgedAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Acknowledged by {alert.acknowledgedBy} on{' '}
                {formatDateTime(alert.acknowledgedAt)}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Snooze Menu */}
      {showSnoozeMenu && (
        <SnoozeMenu
          onSnooze={(duration) => {
            const until = new Date(Date.now() + duration);
            onSnooze(until);
            setShowSnoozeMenu(false);
          }}
          onClose={() => setShowSnoozeMenu(false)}
        />
      )}
    </div>
  );
};
```

## Alert Rules Configuration
```tsx
const AlertRulesConfig: React.FC = () => {
  const { data: rules, refetch } = useAlertRules();
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Alert Rules</h3>
        <Button onClick={() => setEditingRule(createNewRule())}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow divide-y">
        {rules?.map((rule) => (
          <AlertRuleItem
            key={rule.id}
            rule={rule}
            onEdit={() => setEditingRule(rule)}
            onToggle={(enabled) => updateRule(rule.id, { enabled })}
            onDelete={() => deleteRule(rule.id)}
          />
        ))}
      </div>
      
      {editingRule && (
        <AlertRuleModal
          rule={editingRule}
          onSave={(rule) => {
            saveRule(rule);
            setEditingRule(null);
            refetch();
          }}
          onClose={() => setEditingRule(null)}
        />
      )}
    </div>
  );
};
```

## Notification Preferences
```tsx
const NotificationPreferences: React.FC = () => {
  const { data: preferences, mutate: updatePreferences } = useNotificationPreferences();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Notification Settings</h3>
      
      <div className="space-y-4">
        {Object.values(AlertType).map((type) => (
          <div key={type} className="bg-white rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{getAlertTypeLabel(type)}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {getAlertTypeDescription(type)}
                </p>
              </div>
              
              <Switch
                checked={preferences?.[type]?.enabled ?? true}
                onCheckedChange={(enabled) => 
                  updatePreferences({ [type]: { enabled } })
                }
              />
            </div>
            
            {preferences?.[type]?.enabled && (
              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences[type].channels.includes('email')}
                    onChange={(e) => toggleChannel(type, 'email', e.target.checked)}
                  />
                  <span className="text-sm">Email</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences[type].channels.includes('browser')}
                    onChange={(e) => toggleChannel(type, 'browser', e.target.checked)}
                  />
                  <span className="text-sm">Browser notifications</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences[type].channels.includes('sms')}
                    onChange={(e) => toggleChannel(type, 'sms', e.target.checked)}
                  />
                  <span className="text-sm">SMS (Critical only)</span>
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Alert Analytics
```tsx
const AlertAnalytics: React.FC = () => {
  const { data: stats } = useAlertStatistics({ days: 30 });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <StatCard
        title="Alert Volume"
        value={stats?.total || 0}
        change={stats?.volumeChange}
        chart={<AlertVolumeChart data={stats?.dailyVolume} />}
      />
      
      <StatCard
        title="Average Response Time"
        value={formatDuration(stats?.avgResponseTime || 0)}
        change={stats?.responseTimeChange}
        chart={<ResponseTimeChart data={stats?.responseTimeByPriority} />}
      />
      
      <StatCard
        title="Alert Types"
        chart={<AlertTypeDistribution data={stats?.byType} />}
      />
      
      <StatCard
        title="Resolution Rate"
        value={`${stats?.resolutionRate || 0}%`}
        change={stats?.resolutionRateChange}
        chart={<ResolutionTrendChart data={stats?.resolutionTrend} />}
      />
    </div>
  );
};
```

## Acceptance Criteria
- [ ] Alerts generate in real-time
- [ ] Notifications deliver reliably
- [ ] Priority system works correctly
- [ ] Actions execute properly
- [ ] Snooze functionality works
- [ ] Analytics display accurately

## Where to Create
- `packages/web-dashboard/src/components/alerts/`
- `packages/web-dashboard/src/services/alertService.ts`
- `packages/web-dashboard/src/hooks/useAlerts.ts`

## Performance Requirements
- Alert generation < 100ms
- Notification delivery < 1s
- Real-time updates < 500ms
- Handle 1000+ alerts efficiently

## Estimated Effort
4.5 hours