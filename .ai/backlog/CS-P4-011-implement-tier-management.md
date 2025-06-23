# Task: Implement Tier Management System

**ID:** CS-P4-011  
**Phase:** Web Dashboard  
**Dependencies:** CS-P4-010

## Objective
Create a tier management interface that allows organizers to update client tiers, view tier benefits, track tier history, and manage tier-based features with proper authorization and audit trails.

## Context
Client tiers (Silver, Gold, Platinum) determine service levels and available features. Organizers need to manage tier assignments based on client value, with clear visibility into tier benefits and history. All tier changes must be audited for compliance.

## Requirements
- Tier update interface with justification
- Tier benefit comparison matrix
- Tier change history timeline
- Bulk tier updates
- Tier analytics dashboard
- Email notifications on tier change

## Technical Guidance
- Build modal-based update flow
- Implement audit logging
- Create tier comparison table
- Use optimistic updates
- Apply permission checks
- Generate tier reports

## Tier Management Components
```typescript
interface TierManagementSystem {
  // Tier operations
  updateClientTier(clientId: string, tier: ClientTier, reason: string): Promise<void>;
  bulkUpdateTiers(updates: TierUpdate[]): Promise<BulkUpdateResult>;
  getTierHistory(clientId: string): Promise<TierHistoryEntry[]>;
  
  // Analytics
  getTierDistribution(): Promise<TierDistribution>;
  getTierMigration(period: DateRange): Promise<TierMigration>;
  getTierRevenue(): Promise<TierRevenue>;
  
  // Configuration
  getTierBenefits(): Promise<TierBenefits>;
  updateTierBenefits(benefits: TierBenefits): Promise<void>;
}

interface TierUpdate {
  clientId: string;
  currentTier: ClientTier;
  newTier: ClientTier;
  reason: string;
  effectiveDate?: Date;
  notifyClient: boolean;
}
```

## Tier Update Modal
```tsx
// src/components/tier/TierUpdateModal.tsx
export const TierUpdateModal: React.FC<TierUpdateModalProps> = ({
  client,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [selectedTier, setSelectedTier] = useState<ClientTier>(client.tier);
  const [reason, setReason] = useState('');
  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const [notifyClient, setNotifyClient] = useState(true);
  
  const { mutate: updateTier, isLoading } = useMutation({
    mutationFn: (data: TierUpdate) => tierService.updateClientTier(data),
    onSuccess: () => {
      toast.success('Tier updated successfully');
      onUpdate();
      onClose();
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateTier({
      clientId: client.id,
      currentTier: client.tier,
      newTier: selectedTier,
      reason,
      effectiveDate,
      notifyClient,
    });
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Client Tier">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Current Tier</h3>
          <TierBadge tier={client.tier} size="lg" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            New Tier
          </label>
          <TierSelector
            value={selectedTier}
            onChange={setSelectedTier}
            exclude={[client.tier]}
          />
        </div>
        
        <TierComparisonTable
          currentTier={client.tier}
          newTier={selectedTier}
        />
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Reason for Change <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border-gray-300"
            rows={3}
            required
            placeholder="Explain why this tier change is being made..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Effective Date
          </label>
          <DatePicker
            value={effectiveDate}
            onChange={setEffectiveDate}
            minDate={new Date()}
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="notifyClient"
            checked={notifyClient}
            onChange={(e) => setNotifyClient(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="notifyClient" className="ml-2 text-sm">
            Send email notification to client
          </label>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={!reason || selectedTier === client.tier}
          >
            Update Tier
          </Button>
        </div>
      </form>
    </Modal>
  );
};
```

## Tier Comparison Table
```tsx
const TierComparisonTable: React.FC<TierComparisonProps> = ({
  currentTier,
  newTier,
}) => {
  const benefits = {
    silver: {
      flightClass: 'Economy',
      hotelCategory: '3-4 Star',
      prioritySupport: false,
      dedicatedManager: false,
      loungeAccess: false,
      upgrades: 'Subject to availability',
    },
    gold: {
      flightClass: 'Premium Economy / Business',
      hotelCategory: '4-5 Star',
      prioritySupport: true,
      dedicatedManager: false,
      loungeAccess: true,
      upgrades: 'Complimentary when available',
    },
    platinum: {
      flightClass: 'Business / First',
      hotelCategory: '5 Star / Luxury',
      prioritySupport: true,
      dedicatedManager: true,
      loungeAccess: true,
      upgrades: 'Guaranteed upgrades',
    },
  };
  
  const features = [
    { key: 'flightClass', label: 'Flight Class' },
    { key: 'hotelCategory', label: 'Hotel Category' },
    { key: 'prioritySupport', label: '24/7 Priority Support' },
    { key: 'dedicatedManager', label: 'Dedicated Account Manager' },
    { key: 'loungeAccess', label: 'Airport Lounge Access' },
    { key: 'upgrades', label: 'Complimentary Upgrades' },
  ];
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Feature</th>
            <th className="px-4 py-2 text-center">
              Current ({currentTier})
            </th>
            <th className="px-4 py-2 text-center">
              New ({newTier})
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => {
            const current = benefits[currentTier][feature.key];
            const next = benefits[newTier][feature.key];
            const isUpgrade = 
              (typeof current === 'boolean' && !current && next) ||
              (typeof current === 'string' && current !== next);
            
            return (
              <tr key={feature.key} className="border-t">
                <td className="px-4 py-2">{feature.label}</td>
                <td className="px-4 py-2 text-center">
                  {typeof current === 'boolean' ? (
                    current ? '✓' : '✗'
                  ) : (
                    current
                  )}
                </td>
                <td className={cn(
                  "px-4 py-2 text-center",
                  isUpgrade && "text-green-600 font-medium"
                )}>
                  {typeof next === 'boolean' ? (
                    next ? '✓' : '✗'
                  ) : (
                    next
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
```

## Tier History Timeline
```tsx
const TierHistoryTimeline: React.FC<{ clientId: string }> = ({ clientId }) => {
  const { data: history, isLoading } = useTierHistory(clientId);
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Tier History</h3>
      
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        {history?.map((entry, index) => (
          <div key={entry.id} className="relative flex items-start mb-6">
            <div className={cn(
              "absolute left-4 w-2 h-2 rounded-full -translate-x-1/2",
              index === 0 ? "bg-primary-600" : "bg-gray-400"
            )} />
            
            <div className="ml-10">
              <div className="flex items-center gap-3">
                <TierBadge tier={entry.tier} />
                {entry.previousTier && (
                  <>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <TierBadge tier={entry.tier} />
                  </>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mt-1">
                {entry.reason}
              </p>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>{formatDate(entry.effectiveDate)}</span>
                <span>by {entry.updatedBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Bulk Tier Update
```tsx
const BulkTierUpdate: React.FC = () => {
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [targetTier, setTargetTier] = useState<ClientTier>();
  const [reason, setReason] = useState('');
  
  const { mutate: bulkUpdate, isLoading } = useBulkUpdateTiers();
  
  const handleBulkUpdate = () => {
    const updates = selectedClients.map(client => ({
      clientId: client.id,
      currentTier: client.tier,
      newTier: targetTier!,
      reason,
      notifyClient: true,
    }));
    
    bulkUpdate(updates);
  };
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h4 className="font-medium mb-3">Bulk Tier Update</h4>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Selected: {selectedClients.length} clients
          </p>
          
          <div className="flex gap-2">
            <Select
              value={targetTier}
              onChange={setTargetTier}
              placeholder="Select target tier"
            >
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </Select>
            
            <Button
              onClick={handleBulkUpdate}
              disabled={!targetTier || !reason}
              loading={isLoading}
            >
              Update {selectedClients.length} Clients
            </Button>
          </div>
        </div>
        
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for bulk update..."
          className="w-full text-sm rounded border-gray-300"
          rows={2}
        />
      </div>
    </div>
  );
};
```

## Tier Analytics Dashboard
```tsx
const TierAnalytics: React.FC = () => {
  const { data: distribution } = useTierDistribution();
  const { data: migration } = useTierMigration({ months: 6 });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Tier Distribution">
        <PieChart
          data={distribution}
          colors={{
            silver: '#C0C0C0',
            gold: '#FFD700',
            platinum: '#E5E4E2',
          }}
        />
      </Card>
      
      <Card title="Tier Migration (6 months)">
        <SankeyDiagram
          data={migration}
          nodeColors={{
            silver: '#C0C0C0',
            gold: '#FFD700',
            platinum: '#E5E4E2',
          }}
        />
      </Card>
      
      <Card title="Revenue by Tier">
        <BarChart
          data={distribution?.map(d => ({
            tier: d.tier,
            revenue: d.totalRevenue,
            avgRevenue: d.avgRevenuePerClient,
          }))}
        />
      </Card>
      
      <Card title="Tier Upgrade Trends">
        <LineChart
          data={migration?.monthly}
          lines={['upgrades', 'downgrades']}
        />
      </Card>
    </div>
  );
};
```

## Acceptance Criteria
- [ ] Tier updates save correctly
- [ ] History displays accurately
- [ ] Comparison table shows benefits
- [ ] Bulk updates process successfully
- [ ] Analytics load properly
- [ ] Audit trail captures all changes

## Where to Create
- `packages/web-dashboard/src/components/tier/`
- `packages/web-dashboard/src/services/tierService.ts`
- `packages/web-dashboard/src/hooks/useTierManagement.ts`

## Compliance Requirements
- All tier changes logged
- Reason required for updates
- Email notifications sent
- History retained indefinitely
- Export capability for audits

## Estimated Effort
3.5 hours