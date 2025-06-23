# Task: Create Allowlist Manager

**ID:** CS-P4-012  
**Phase:** Web Dashboard  
**Dependencies:** CS-P4-013, CS-P1-002

## Objective
Build a comprehensive allowlist management interface for controlling which email addresses can register for the mobile app, including bulk operations, domain rules, and invitation tracking.

## Context
The allowlist is a critical security feature that ensures only authorized clients can access the platform. Organizers need efficient tools to manage individual emails, domain rules, and track invitation status while maintaining an audit trail of all changes.

## Requirements
- Email allowlist CRUD operations
- Domain-based rules
- Bulk import/export
- Invitation status tracking
- Temporary access tokens
- Audit logging

## Technical Guidance
- Implement with data tables
- Use modal for add/edit
- Apply email validation
- Support CSV import
- Create domain rules
- Track invitation metrics

## Allowlist Service
```typescript
interface AllowlistService {
  // Email management
  getEmails(params: AllowlistQuery): Promise<PaginatedResponse<AllowlistEntry>>;
  addEmail(email: string, metadata?: EmailMetadata): Promise<AllowlistEntry>;
  removeEmail(email: string, reason: string): Promise<void>;
  bulkAddEmails(emails: string[], metadata?: EmailMetadata): Promise<BulkResult>;
  
  // Domain rules
  getDomainRules(): Promise<DomainRule[]>;
  addDomainRule(domain: string, rule: RuleType): Promise<DomainRule>;
  removeDomainRule(id: string): Promise<void>;
  
  // Invitations
  sendInvitation(email: string): Promise<void>;
  resendInvitation(email: string): Promise<void>;
  getInvitationStatus(email: string): Promise<InvitationStatus>;
  
  // Import/Export
  importFromCSV(file: File): Promise<ImportResult>;
  exportToCSV(filters?: AllowlistQuery): Promise<Blob>;
}

interface AllowlistEntry {
  id: string;
  email: string;
  status: 'pending' | 'invited' | 'registered' | 'blocked';
  tier?: ClientTier;
  addedBy: string;
  addedAt: Date;
  invitedAt?: Date;
  registeredAt?: Date;
  metadata?: Record<string, any>;
}

interface DomainRule {
  id: string;
  domain: string;
  rule: 'allow' | 'block' | 'auto_approve';
  priority: number;
  createdBy: string;
  createdAt: Date;
}
```

## Main Component
```tsx
// src/pages/allowlist/AllowlistPage.tsx
export const AllowlistPage: React.FC = () => {
  const [view, setView] = useState<'emails' | 'domains'>('emails');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<AllowlistFilters>({});
  
  const { data, isLoading, refetch } = useAllowlist(filters);
  const { hasPermission } = usePermissions();
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Allowlist Management"
        description="Control who can access the ClientSync platform"
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => exportAllowlist(filters)}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            <CanAccess permissions={[Permission.MANAGE_ALLOWLIST]}>
              <Button onClick={() => openAddModal()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Email
              </Button>
            </CanAccess>
          </div>
        }
      />
      
      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="emails">Email Addresses</TabsTrigger>
          <TabsTrigger value="domains">Domain Rules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="emails">
          <EmailAllowlist
            emails={data?.emails || []}
            isLoading={isLoading}
            onRefresh={refetch}
            selectedEmails={selectedEmails}
            onSelectionChange={setSelectedEmails}
          />
        </TabsContent>
        
        <TabsContent value="domains">
          <DomainRules />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

## Email List Component
```tsx
const EmailAllowlist: React.FC<EmailAllowlistProps> = ({
  emails,
  isLoading,
  onRefresh,
  selectedEmails,
  onSelectionChange,
}) => {
  const columns = useMemo<ColumnDef<AllowlistEntry>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email Address',
        cell: ({ getValue }) => (
          <div>
            <span className="font-medium">{getValue()}</span>
            {row.original.tier && (
              <TierBadge tier={row.original.tier} size="sm" className="ml-2" />
            )}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as AllowlistEntry['status'];
          return (
            <Badge
              variant={
                status === 'registered' ? 'success' :
                status === 'invited' ? 'warning' :
                status === 'blocked' ? 'danger' :
                'default'
              }
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'invitedAt',
        header: 'Invited',
        cell: ({ getValue }) => 
          getValue() ? formatDate(getValue()) : '-',
      },
      {
        accessorKey: 'registeredAt',
        header: 'Registered',
        cell: ({ getValue }) => 
          getValue() ? formatDate(getValue()) : '-',
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <EmailActions
            entry={row.original}
            onUpdate={onRefresh}
          />
        ),
      },
    ],
    [onRefresh]
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <AllowlistFilters onFiltersChange={setFilters} />
        
        {selectedEmails.size > 0 && (
          <BulkEmailActions
            selectedCount={selectedEmails.size}
            onAction={(action) => handleBulkAction(action, selectedEmails)}
          />
        )}
      </div>
      
      <DataTable
        columns={columns}
        data={emails}
        isLoading={isLoading}
        onRowSelectionChange={onSelectionChange}
      />
    </div>
  );
};
```

## Add Email Modal
```tsx
const AddEmailModal: React.FC<AddEmailModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [emails, setEmails] = useState('');
  const [tier, setTier] = useState<ClientTier>('silver');
  const [sendInvite, setSendInvite] = useState(true);
  
  const { mutate: addEmails, isLoading } = useMutation({
    mutationFn: (data: AddEmailsDto) => allowlistService.bulkAddEmails(data),
    onSuccess: (result) => {
      toast.success(`Added ${result.success} emails to allowlist`);
      if (result.failed > 0) {
        toast.warning(`${result.failed} emails failed (duplicates or invalid)`);
      }
      onAdd();
      onClose();
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailList = emails
      .split(/[\n,;]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    addEmails({
      emails: emailList,
      metadata: { tier, sendInvite },
    });
  };
  
  const validEmails = useMemo(() => {
    return emails
      .split(/[\n,;]/)
      .map(email => email.trim())
      .filter(email => isValidEmail(email));
  }, [emails]);
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Emails to Allowlist"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Email Addresses
          </label>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            className="w-full rounded-md border-gray-300"
            rows={6}
            placeholder="Enter email addresses (one per line or comma-separated)"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Valid emails detected: {validEmails.length}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Default Tier
          </label>
          <TierSelector value={tier} onChange={setTier} />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="sendInvite"
            checked={sendInvite}
            onChange={(e) => setSendInvite(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="sendInvite" className="ml-2 text-sm">
            Send invitation emails immediately
          </label>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={validEmails.length === 0}
          >
            Add {validEmails.length} Email{validEmails.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
```

## Domain Rules Management
```tsx
const DomainRules: React.FC = () => {
  const { data: rules, refetch } = useDomainRules();
  const [showAddModal, setShowAddModal] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Domain rules automatically apply to all emails from specified domains
        </p>
        
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Domain Rule
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Domain
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Rule
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Created
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rules?.map((rule) => (
              <tr key={rule.id}>
                <td className="px-6 py-4">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    *@{rule.domain}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={
                      rule.rule === 'allow' ? 'success' :
                      rule.rule === 'block' ? 'danger' :
                      'warning'
                    }
                  >
                    {rule.rule}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm">
                  {rule.priority}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(rule.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDomainRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <AddDomainRuleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={refetch}
      />
    </div>
  );
};
```

## Bulk Import
```tsx
const BulkImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const { mutate: importFile, isLoading } = useImportAllowlist();
  
  const handleImport = () => {
    if (!file) return;
    
    importFile(file, {
      onSuccess: (result) => {
        toast.success(
          `Imported ${result.success} emails successfully`
        );
        if (result.errors.length > 0) {
          // Show error details
        }
      },
    });
  };
  
  return (
    <div className="border-2 border-dashed rounded-lg p-6">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="hidden"
        id="csv-upload"
      />
      
      <label
        htmlFor="csv-upload"
        className="cursor-pointer flex flex-col items-center"
      >
        <Upload className="h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Click to upload CSV file
        </p>
      </label>
      
      {file && (
        <div className="mt-4">
          <p className="text-sm">{file.name}</p>
          <Button
            onClick={handleImport}
            loading={isLoading}
            className="mt-2"
          >
            Import Emails
          </Button>
        </div>
      )}
      
      <a
        href="/templates/allowlist-template.csv"
        download
        className="text-sm text-primary-600 hover:underline mt-4 inline-block"
      >
        Download CSV template
      </a>
    </div>
  );
};
```

## Acceptance Criteria
- [ ] Emails can be added/removed
- [ ] Domain rules function correctly
- [ ] Bulk import processes CSV files
- [ ] Invitations send successfully
- [ ] Status tracking works
- [ ] Audit log captures changes

## Where to Create
- `packages/web-dashboard/src/pages/allowlist/AllowlistPage.tsx`
- Components in `src/components/allowlist/`
- Services in `src/services/allowlistService.ts`

## Security Considerations
- Validate email formats
- Check permissions for all actions
- Log all modifications
- Rate limit bulk operations
- Sanitize CSV imports

## Estimated Effort
4 hours