# Task: Add GDPR Compliance Features

**ID:** CS-P5-006  
**Phase:** Testing & Deployment  
**Dependencies:** CS-P4-010, CS-P3-006

## Objective
Implement comprehensive GDPR compliance features including data privacy controls, consent management, data portability, and the right to be forgotten, ensuring full compliance with European data protection regulations.

## Context
GDPR compliance is mandatory for handling EU citizens' data. The implementation must provide users with control over their personal data, transparent data processing information, and mechanisms for exercising their privacy rights. This includes both technical implementations and user-facing interfaces.

## Requirements
- Privacy consent management
- Data export functionality
- Right to erasure (deletion)
- Data processing transparency
- Cookie consent system
- Privacy policy integration

## Technical Guidance
- Implement consent tracking
- Create data export pipeline
- Build deletion workflows
- Add audit logging
- Generate compliance reports
- Ensure data encryption

## GDPR Service Architecture
```typescript
interface GDPRService {
  // Consent Management
  getConsents(userId: string): Promise<ConsentRecord[]>;
  updateConsent(userId: string, consent: ConsentUpdate): Promise<void>;
  getConsentHistory(userId: string): Promise<ConsentHistory[]>;
  
  // Data Access
  exportUserData(userId: string, format: 'json' | 'csv'): Promise<DataExport>;
  getDataCategories(userId: string): Promise<DataCategory[]>;
  
  // Data Deletion
  initiateDataDeletion(userId: string, options: DeletionOptions): Promise<DeletionRequest>;
  getDeletionStatus(requestId: string): Promise<DeletionStatus>;
  
  // Data Processing
  getProcessingActivities(userId: string): Promise<ProcessingActivity[]>;
  getDataRetentionPolicies(): Promise<RetentionPolicy[]>;
  
  // Compliance
  generateComplianceReport(userId: string): Promise<ComplianceReport>;
  logDataAccess(access: DataAccessLog): Promise<void>;
}

interface ConsentRecord {
  id: string;
  userId: string;
  type: ConsentType;
  granted: boolean;
  version: string;
  grantedAt?: Date;
  revokedAt?: Date;
  ipAddress: string;
  userAgent: string;
}

enum ConsentType {
  ESSENTIAL = 'essential',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  PERSONALIZATION = 'personalization',
  DATA_SHARING = 'data_sharing',
}
```

## Privacy Center Component
```tsx
// packages/mobile-app/src/screens/PrivacyCenter.tsx
export const PrivacyCenter: React.FC = () => {
  const { user } = useAuth();
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [activeSection, setActiveSection] = useState<'consents' | 'data' | 'rights'>('consents');
  
  useEffect(() => {
    loadUserConsents();
  }, []);
  
  const loadUserConsents = async () => {
    const userConsents = await gdprService.getConsents(user.id);
    setConsents(userConsents);
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Privacy Center</Text>
        <Text style={styles.subtitle}>
          Manage your data and privacy preferences
        </Text>
      </View>
      
      <SegmentedControl
        values={['Consents', 'My Data', 'My Rights']}
        selectedIndex={['consents', 'data', 'rights'].indexOf(activeSection)}
        onChange={(index) => {
          setActiveSection(['consents', 'data', 'rights'][index]);
        }}
      />
      
      {activeSection === 'consents' && (
        <ConsentManagement
          consents={consents}
          onUpdate={loadUserConsents}
        />
      )}
      
      {activeSection === 'data' && (
        <DataManagement userId={user.id} />
      )}
      
      {activeSection === 'rights' && (
        <PrivacyRights userId={user.id} />
      )}
    </ScrollView>
  );
};
```

## Consent Management
```tsx
// src/components/privacy/ConsentManagement.tsx
const ConsentManagement: React.FC<ConsentManagementProps> = ({
  consents,
  onUpdate,
}) => {
  const [updating, setUpdating] = useState<string | null>(null);
  
  const consentDescriptions = {
    [ConsentType.ESSENTIAL]: {
      title: 'Essential Services',
      description: 'Required for basic app functionality and security',
      required: true,
    },
    [ConsentType.ANALYTICS]: {
      title: 'Analytics & Performance',
      description: 'Help us improve the app by collecting usage data',
      required: false,
    },
    [ConsentType.MARKETING]: {
      title: 'Marketing Communications',
      description: 'Receive updates about features and travel offers',
      required: false,
    },
    [ConsentType.PERSONALIZATION]: {
      title: 'Personalization',
      description: 'Use your data to personalize your experience',
      required: false,
    },
    [ConsentType.DATA_SHARING]: {
      title: 'Partner Data Sharing',
      description: 'Share data with travel partners for better service',
      required: false,
    },
  };
  
  const handleConsentToggle = async (type: ConsentType, granted: boolean) => {
    setUpdating(type);
    
    try {
      await gdprService.updateConsent(user.id, {
        type,
        granted,
        version: CONSENT_VERSION,
      });
      
      await onUpdate();
      
      Alert.alert(
        'Consent Updated',
        `Your ${consentDescriptions[type].title} preference has been updated.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update consent. Please try again.');
    } finally {
      setUpdating(null);
    }
  };
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Privacy Consents</Text>
      <Text style={styles.sectionDescription}>
        Control how we collect and use your data
      </Text>
      
      {Object.entries(consentDescriptions).map(([type, info]) => {
        const consent = consents.find(c => c.type === type);
        const isGranted = consent?.granted ?? false;
        const isUpdating = updating === type;
        
        return (
          <View key={type} style={styles.consentItem}>
            <View style={styles.consentInfo}>
              <Text style={styles.consentTitle}>{info.title}</Text>
              <Text style={styles.consentDescription}>{info.description}</Text>
              {consent?.grantedAt && (
                <Text style={styles.consentDate}>
                  {isGranted ? 'Granted' : 'Revoked'} on{' '}
                  {formatDate(isGranted ? consent.grantedAt : consent.revokedAt)}
                </Text>
              )}
            </View>
            
            <Switch
              value={isGranted}
              onValueChange={(value) => handleConsentToggle(type as ConsentType, value)}
              disabled={info.required || isUpdating}
            />
          </View>
        );
      })}
      
      <TouchableOpacity
        style={styles.link}
        onPress={() => Linking.openURL('https://clientsync.com/privacy-policy')}
      >
        <Text style={styles.linkText}>View Full Privacy Policy</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Data Export Functionality
```tsx
// src/components/privacy/DataManagement.tsx
const DataManagement: React.FC<{ userId: string }> = ({ userId }) => {
  const [categories, setCategories] = useState<DataCategory[]>([]);
  const [exporting, setExporting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    loadDataCategories();
  }, []);
  
  const loadDataCategories = async () => {
    const cats = await gdprService.getDataCategories(userId);
    setCategories(cats);
    setSelectedCategories(new Set(cats.map(c => c.id)));
  };
  
  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    
    try {
      const exportData = await gdprService.exportUserData(userId, {
        format,
        categories: Array.from(selectedCategories),
      });
      
      // Download file
      const blob = new Blob([exportData.data], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      });
      
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-data-${Date.now()}.${format}`;
        a.click();
      } else {
        // Mobile file save
        const path = `${RNFS.DocumentDirectoryPath}/my-data-${Date.now()}.${format}`;
        await RNFS.writeFile(path, exportData.data, 'utf8');
        
        Share.open({
          url: `file://${path}`,
          type: format === 'json' ? 'application/json' : 'text/csv',
        });
      }
      
      // Log export for compliance
      await gdprService.logDataAccess({
        userId,
        action: 'DATA_EXPORT',
        timestamp: new Date(),
        categories: Array.from(selectedCategories),
      });
      
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Your Data</Text>
      <Text style={styles.sectionDescription}>
        Select the data you want to export
      </Text>
      
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={styles.categoryItem}
          onPress={() => {
            const newSelected = new Set(selectedCategories);
            if (newSelected.has(category.id)) {
              newSelected.delete(category.id);
            } else {
              newSelected.add(category.id);
            }
            setSelectedCategories(newSelected);
          }}
        >
          <CheckBox
            value={selectedCategories.has(category.id)}
            onValueChange={() => {}}
          />
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
            <Text style={styles.categoryCount}>
              {category.recordCount} records
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      
      <View style={styles.exportButtons}>
        <Button
          title="Export as JSON"
          onPress={() => handleExport('json')}
          loading={exporting}
          disabled={selectedCategories.size === 0}
        />
        <Button
          title="Export as CSV"
          onPress={() => handleExport('csv')}
          loading={exporting}
          disabled={selectedCategories.size === 0}
        />
      </View>
    </View>
  );
};
```

## Right to Erasure Implementation
```tsx
// src/components/privacy/PrivacyRights.tsx
const PrivacyRights: React.FC<{ userId: string }> = ({ userId }) => {
  const [deletionRequest, setDeletionRequest] = useState<DeletionRequest | null>(null);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  
  const handleDeletionRequest = async (options: DeletionOptions) => {
    try {
      const request = await gdprService.initiateDataDeletion(userId, options);
      setDeletionRequest(request);
      
      Alert.alert(
        'Deletion Request Submitted',
        'Your data deletion request has been submitted. You will receive an email confirmation.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit deletion request.');
    }
  };
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Your Privacy Rights</Text>
      
      <RightCard
        title="Right to Access"
        description="Request a copy of all data we hold about you"
        icon="folder-open"
        onPress={() => navigation.navigate('DataExport')}
      />
      
      <RightCard
        title="Right to Rectification"
        description="Correct any inaccurate personal data"
        icon="edit"
        onPress={() => navigation.navigate('Profile')}
      />
      
      <RightCard
        title="Right to Erasure"
        description="Request deletion of your personal data"
        icon="trash"
        onPress={() => setShowDeletionModal(true)}
        danger
      />
      
      <RightCard
        title="Right to Data Portability"
        description="Transfer your data to another service"
        icon="share"
        onPress={() => navigation.navigate('DataExport')}
      />
      
      <RightCard
        title="Right to Object"
        description="Object to certain types of data processing"
        icon="hand-stop"
        onPress={() => navigation.navigate('ConsentManagement')}
      />
      
      <DeletionModal
        visible={showDeletionModal}
        onClose={() => setShowDeletionModal(false)}
        onConfirm={handleDeletionRequest}
        userId={userId}
      />
    </View>
  );
};
```

## Cookie Consent Banner
```tsx
// packages/web-dashboard/src/components/CookieConsent.tsx
export const CookieConsent: React.FC = () => {
  const [show, setShow] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });
  
  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      setShow(true);
    }
  }, []);
  
  const handleAcceptAll = () => {
    const allConsent = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    
    saveCookieConsent(allConsent);
    applyCookiePreferences(allConsent);
    setShow(false);
  };
  
  const handleAcceptSelected = () => {
    saveCookieConsent(preferences);
    applyCookiePreferences(preferences);
    setShow(false);
  };
  
  const handleRejectAll = () => {
    const minimalConsent = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    
    saveCookieConsent(minimalConsent);
    applyCookiePreferences(minimalConsent);
    setShow(false);
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-8">
            <h3 className="text-lg font-semibold mb-2">
              We value your privacy
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We use cookies to enhance your browsing experience, analyze site traffic,
              and personalize content. By clicking "Accept All", you consent to our use
              of cookies.
            </p>
            
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-primary-600 hover:underline">
                Customize cookie preferences
              </summary>
              
              <div className="mt-4 space-y-3">
                <CookieToggle
                  label="Essential Cookies"
                  description="Required for basic site functionality"
                  checked={preferences.essential}
                  disabled={true}
                  onChange={() => {}}
                />
                
                <CookieToggle
                  label="Analytics Cookies"
                  description="Help us understand how you use our site"
                  checked={preferences.analytics}
                  onChange={(checked) => 
                    setPreferences({ ...preferences, analytics: checked })
                  }
                />
                
                <CookieToggle
                  label="Marketing Cookies"
                  description="Used to deliver personalized advertisements"
                  checked={preferences.marketing}
                  onChange={(checked) => 
                    setPreferences({ ...preferences, marketing: checked })
                  }
                />
              </div>
            </details>
            
            <a
              href="/privacy-policy"
              className="text-sm text-primary-600 hover:underline"
            >
              Read our Privacy Policy
            </a>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleAcceptAll} variant="primary">
              Accept All
            </Button>
            <Button onClick={handleAcceptSelected} variant="outline">
              Accept Selected
            </Button>
            <Button onClick={handleRejectAll} variant="ghost">
              Reject All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## GDPR Audit Logging
```typescript
// src/services/gdprAuditLogger.ts
export class GDPRAuditLogger {
  async logConsentChange(change: ConsentChange): Promise<void> {
    await supabase.from('gdpr_consent_log').insert({
      user_id: change.userId,
      consent_type: change.type,
      action: change.granted ? 'GRANTED' : 'REVOKED',
      consent_version: change.version,
      ip_address: change.ipAddress,
      user_agent: change.userAgent,
      timestamp: new Date(),
      metadata: {
        source: change.source,
        session_id: change.sessionId,
      },
    });
  }
  
  async logDataAccess(access: DataAccessLog): Promise<void> {
    await supabase.from('gdpr_data_access_log').insert({
      user_id: access.userId,
      accessor_id: access.accessorId,
      action: access.action,
      data_categories: access.categories,
      purpose: access.purpose,
      legal_basis: access.legalBasis,
      timestamp: new Date(),
    });
  }
  
  async logDataDeletion(deletion: DataDeletionLog): Promise<void> {
    await supabase.from('gdpr_deletion_log').insert({
      user_id: deletion.userId,
      deletion_type: deletion.type,
      data_categories: deletion.categories,
      reason: deletion.reason,
      deleted_at: new Date(),
      retention_period: deletion.retentionPeriod,
      anonymized_data: deletion.anonymizedData,
    });
  }
  
  async generateComplianceReport(userId: string): Promise<ComplianceReport> {
    const [consents, accesses, processing] = await Promise.all([
      this.getConsentHistory(userId),
      this.getAccessHistory(userId),
      this.getProcessingActivities(userId),
    ]);
    
    return {
      userId,
      generatedAt: new Date(),
      consents: {
        current: consents.filter(c => c.active),
        history: consents,
      },
      dataAccess: {
        exports: accesses.filter(a => a.action === 'EXPORT'),
        views: accesses.filter(a => a.action === 'VIEW'),
      },
      processingActivities: processing,
      retentionPolicies: await this.getRetentionPolicies(),
      thirdPartySharing: await this.getThirdPartySharing(userId),
    };
  }
}
```

## Data Retention Policies
```typescript
// src/config/dataRetention.ts
export const DATA_RETENTION_POLICIES: RetentionPolicy[] = [
  {
    category: 'profile',
    description: 'Basic profile information',
    retentionPeriod: '3 years after account deletion',
    legalBasis: 'Legitimate interest',
    deletionMethod: 'Hard delete',
  },
  {
    category: 'preferences',
    description: 'Travel preferences and settings',
    retentionPeriod: '1 year after last activity',
    legalBasis: 'Consent',
    deletionMethod: 'Hard delete',
  },
  {
    category: 'trips',
    description: 'Trip history and itineraries',
    retentionPeriod: '7 years for tax purposes',
    legalBasis: 'Legal obligation',
    deletionMethod: 'Anonymization',
  },
  {
    category: 'analytics',
    description: 'Usage analytics data',
    retentionPeriod: '2 years',
    legalBasis: 'Legitimate interest',
    deletionMethod: 'Aggregation',
  },
  {
    category: 'support',
    description: 'Support tickets and communications',
    retentionPeriod: '3 years after resolution',
    legalBasis: 'Legitimate interest',
    deletionMethod: 'Hard delete',
  },
];

export async function enforceRetentionPolicies(): Promise<void> {
  for (const policy of DATA_RETENTION_POLICIES) {
    const expiredData = await getExpiredData(policy);
    
    for (const record of expiredData) {
      if (policy.deletionMethod === 'Hard delete') {
        await deleteRecord(record);
      } else if (policy.deletionMethod === 'Anonymization') {
        await anonymizeRecord(record);
      } else if (policy.deletionMethod === 'Aggregation') {
        await aggregateRecord(record);
      }
      
      await logRetentionAction({
        policy,
        recordId: record.id,
        action: policy.deletionMethod,
      });
    }
  }
}
```

## Acceptance Criteria
- [ ] Consent management works
- [ ] Data export functions properly
- [ ] Deletion requests process
- [ ] Cookie banner displays
- [ ] Audit logs capture events
- [ ] Compliance reports generate

## Where to Create
- Mobile: `packages/mobile-app/src/screens/PrivacyCenter.tsx`
- Web: `packages/web-dashboard/src/components/privacy/`
- Services: `packages/shared/src/services/gdpr/`

## Compliance Checklist
- [ ] Explicit consent collection
- [ ] Granular consent options
- [ ] Easy consent withdrawal
- [ ] Data portability formats
- [ ] Deletion verification
- [ ] Privacy by design

## Estimated Effort
4 hours