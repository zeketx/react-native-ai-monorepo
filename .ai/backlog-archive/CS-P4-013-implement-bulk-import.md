# Task: Implement Bulk Import Functionality

**ID:** CS-P4-013  
**Phase:** Web Dashboard  
**Dependencies:** CS-P4-012

## Objective
Create a robust bulk import system for allowlist emails and client data with validation, error handling, progress tracking, and rollback capabilities for large-scale data operations.

## Context
Organizers often need to import hundreds or thousands of emails or client records from existing systems. The import process must handle various file formats, validate data integrity, provide clear error reporting, and allow for partial imports with detailed results.

## Requirements
- Multi-format support (CSV, Excel, JSON)
- Real-time validation and preview
- Progress tracking for large files
- Error reporting with row details
- Duplicate detection and handling
- Rollback capability

## Technical Guidance
- Use Web Workers for parsing
- Implement streaming for large files
- Apply chunked processing
- Create validation pipeline
- Store import history
- Generate detailed reports

## Import Service Architecture
```typescript
interface BulkImportService {
  // File processing
  parseFile(file: File): Promise<ParseResult>;
  validateData(data: any[], schema: ImportSchema): Promise<ValidationResult>;
  
  // Import operations
  importAllowlistEmails(data: EmailImport[]): Promise<ImportResult>;
  importClients(data: ClientImport[]): Promise<ImportResult>;
  importPreferences(data: PreferenceImport[]): Promise<ImportResult>;
  
  // Progress tracking
  createImportSession(type: ImportType): ImportSession;
  updateProgress(sessionId: string, progress: number): void;
  getImportStatus(sessionId: string): ImportStatus;
  
  // History and rollback
  getImportHistory(): Promise<ImportHistory[]>;
  rollbackImport(importId: string): Promise<void>;
}

interface ImportSchema {
  type: 'allowlist' | 'clients' | 'preferences';
  fields: FieldDefinition[];
  validations: ValidationRule[];
  mappings: FieldMapping[];
}

interface ImportResult {
  importId: string;
  total: number;
  success: number;
  failed: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  duration: number;
}
```

## Import Modal Component
```tsx
// src/components/import/BulkImportModal.tsx
export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  importType,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [step, setStep] = useState<ImportStep>('upload');
  
  const schema = getImportSchema(importType);
  
  // File parsing with Web Worker
  const parseFile = useCallback(async (file: File) => {
    const worker = new Worker('/workers/csv-parser.js');
    
    return new Promise<ParseResult>((resolve, reject) => {
      worker.onmessage = (e) => {
        if (e.data.type === 'complete') {
          resolve(e.data.result);
        } else if (e.data.type === 'error') {
          reject(e.data.error);
        } else if (e.data.type === 'progress') {
          // Update progress
        }
      };
      
      worker.postMessage({ file, schema });
    });
  }, [schema]);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFile(file);
    setStep('parsing');
    
    try {
      const result = await parseFile(file);
      setParseResult(result);
      setStep('mapping');
      
      // Auto-detect mappings
      const detectedMappings = autoDetectMappings(
        result.headers,
        schema.fields
      );
      setMappings(detectedMappings);
    } catch (error) {
      toast.error('Failed to parse file');
      setStep('upload');
    }
  };
  
  const validateData = async () => {
    if (!parseResult) return;
    
    setStep('validating');
    
    const mappedData = applyMappings(parseResult.data, mappings);
    const validation = await importService.validateData(mappedData, schema);
    
    setValidationResult(validation);
    setStep('review');
  };
  
  const performImport = async () => {
    if (!validationResult) return;
    
    setStep('importing');
    
    const session = importService.createImportSession(importType);
    
    // Subscribe to progress updates
    session.onProgress((progress) => {
      setImportProgress(progress);
    });
    
    try {
      const result = await importService.import(
        validationResult.validData,
        importType
      );
      
      setStep('complete');
      onSuccess(result);
    } catch (error) {
      toast.error('Import failed');
      setStep('review');
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bulk Import ${importType}`}
      size="xl"
    >
      <div className="space-y-6">
        <ImportSteps currentStep={step} />
        
        {step === 'upload' && (
          <FileUploadStep
            onFileSelect={handleFileSelect}
            acceptedFormats={['.csv', '.xlsx', '.json']}
            maxSize={10 * 1024 * 1024} // 10MB
          />
        )}
        
        {step === 'mapping' && parseResult && (
          <FieldMappingStep
            headers={parseResult.headers}
            fields={schema.fields}
            mappings={mappings}
            onChange={setMappings}
            onNext={validateData}
            sampleData={parseResult.data.slice(0, 5)}
          />
        )}
        
        {step === 'review' && validationResult && (
          <ValidationReviewStep
            result={validationResult}
            onBack={() => setStep('mapping')}
            onImport={performImport}
          />
        )}
        
        {step === 'importing' && (
          <ImportProgressStep
            progress={importProgress}
            estimatedTime={calculateEstimatedTime(validationResult?.validData.length)}
          />
        )}
        
        {step === 'complete' && (
          <ImportCompleteStep
            result={importResult}
            onClose={onClose}
            onViewDetails={() => navigateToImportDetails(importResult.importId)}
          />
        )}
      </div>
    </Modal>
  );
};
```

## Field Mapping Component
```tsx
const FieldMappingStep: React.FC<FieldMappingStepProps> = ({
  headers,
  fields,
  mappings,
  onChange,
  onNext,
  sampleData,
}) => {
  const updateMapping = (fieldId: string, sourceColumn: string | null) => {
    const newMappings = mappings.map(m =>
      m.fieldId === fieldId ? { ...m, sourceColumn } : m
    );
    onChange(newMappings);
  };
  
  const requiredFieldsMapped = fields
    .filter(f => f.required)
    .every(f => mappings.find(m => m.fieldId === f.id && m.sourceColumn));
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">Map CSV Columns to Fields</h3>
        <p className="text-sm text-gray-600">
          Match your file's columns to the required fields
        </p>
      </div>
      
      <div className="space-y-3">
        {fields.map((field) => {
          const mapping = mappings.find(m => m.fieldId === field.id);
          
          return (
            <div key={field.id} className="flex items-center gap-4">
              <div className="w-1/3">
                <label className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <p className="text-xs text-gray-500">{field.description}</p>
              </div>
              
              <Select
                value={mapping?.sourceColumn || ''}
                onChange={(e) => updateMapping(field.id, e.target.value || null)}
                className="flex-1"
              >
                <option value="">-- Select column --</option>
                {headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </Select>
              
              {mapping?.sourceColumn && (
                <div className="text-xs text-gray-500 w-1/3">
                  Sample: {sampleData[0]?.[mapping.sourceColumn] || 'N/A'}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <DataPreview
        headers={headers}
        data={sampleData}
        mappings={mappings}
      />
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('upload')}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!requiredFieldsMapped}
        >
          Validate Data
        </Button>
      </div>
    </div>
  );
};
```

## Validation Review Component
```tsx
const ValidationReviewStep: React.FC<ValidationReviewStepProps> = ({
  result,
  onBack,
  onImport,
}) => {
  const [showErrors, setShowErrors] = useState(true);
  const [selectedError, setSelectedError] = useState<ImportError | null>(null);
  
  return (
    <div className="space-y-6">
      <ValidationSummary
        total={result.total}
        valid={result.valid}
        invalid={result.invalid}
        warnings={result.warnings.length}
      />
      
      {result.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-red-900">
              Validation Errors ({result.errors.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowErrors(!showErrors)}
            >
              {showErrors ? 'Hide' : 'Show'} Details
            </Button>
          </div>
          
          {showErrors && (
            <ErrorList
              errors={result.errors}
              onSelectError={setSelectedError}
              maxDisplay={10}
            />
          )}
        </div>
      )}
      
      {result.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">
            Warnings ({result.warnings.length})
          </h4>
          <ul className="text-sm space-y-1">
            {result.warnings.slice(0, 5).map((warning, i) => (
              <li key={i}>{warning.message}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Import Options</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 mr-2"
            />
            <span className="text-sm">Skip invalid rows and import valid data only</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 mr-2"
            />
            <span className="text-sm">Send email notifications after import</span>
          </label>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Mapping
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => downloadErrorReport(result.errors)}
          >
            Download Error Report
          </Button>
          <Button
            onClick={onImport}
            disabled={result.valid === 0}
          >
            Import {result.valid} Valid Records
          </Button>
        </div>
      </div>
    </div>
  );
};
```

## Import Progress Tracking
```tsx
const ImportProgressStep: React.FC<ImportProgressStepProps> = ({
  progress,
  estimatedTime,
}) => {
  const { elapsed, remaining } = useTimeEstimate(progress, estimatedTime);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
        </div>
        
        <h3 className="text-lg font-medium">Importing Data...</h3>
        <p className="text-gray-600 mt-1">
          Please don't close this window
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Elapsed Time</span>
          <p className="font-medium">{formatDuration(elapsed)}</p>
        </div>
        <div>
          <span className="text-gray-500">Remaining Time</span>
          <p className="font-medium">{formatDuration(remaining)}</p>
        </div>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Large imports may take several minutes. You'll receive a notification
          when the import is complete.
        </AlertDescription>
      </Alert>
    </div>
  );
};
```

## Import History
```tsx
const ImportHistory: React.FC = () => {
  const { data: history } = useImportHistory();
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Recent Imports</h3>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Records</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Imported By</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history?.map((item) => (
              <ImportHistoryRow
                key={item.id}
                import={item}
                onRollback={() => handleRollback(item.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

## Acceptance Criteria
- [ ] Files parse successfully
- [ ] Field mapping works intuitively
- [ ] Validation catches all errors
- [ ] Progress tracking is accurate
- [ ] Import completes reliably
- [ ] Rollback functions properly

## Where to Create
- `packages/web-dashboard/src/components/import/`
- `packages/web-dashboard/src/services/importService.ts`
- `packages/web-dashboard/public/workers/csv-parser.js`

## Performance Requirements
- Parse 10k rows in < 2s
- Validate 10k rows in < 5s
- Import 10k rows in < 30s
- Progress updates every 100ms
- Memory usage < 100MB

## Estimated Effort
4.5 hours