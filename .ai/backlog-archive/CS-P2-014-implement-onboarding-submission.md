# Task: Implement Onboarding Submission Service

**ID:** CS-P2-014  
**Phase:** Onboarding  
**Dependencies:** CS-P2-013, CS-P1-004

## Objective
Create a robust submission service that handles the complete onboarding data persistence to Supabase, including error handling, retry logic, and offline capability.

## Context
The submission service is critical for data integrity, handling complex nested preference data while ensuring reliable delivery even in poor network conditions. It must provide clear feedback and gracefully handle various failure scenarios.

## Requirements
- Atomic transaction for complete profile creation
- Optimistic UI updates with rollback
- Offline queue with sync capability
- Progress tracking for multi-step submission
- Conflict resolution for existing data
- Audit logging for compliance

## Technical Guidance
- Implement with Supabase transactions
- Use React Query for state management
- Apply exponential backoff for retries
- Store queue in AsyncStorage
- Create submission state machine
- Log all operations for audit

## Service Architecture
```typescript
interface OnboardingSubmissionService {
  submit(data: OnboardingData): Promise<SubmissionResult>;
  retryFailedSubmission(id: string): Promise<SubmissionResult>;
  getSubmissionStatus(id: string): SubmissionStatus;
  clearPendingSubmissions(): Promise<void>;
}

interface SubmissionResult {
  success: boolean;
  profileId?: string;
  errors?: SubmissionError[];
  retryable: boolean;
}

interface SubmissionSteps {
  createProfile: StepStatus;
  savePreferences: StepStatus;
  updateAllowlist: StepStatus;
  sendWelcomeEmail: StepStatus;
  syncToAnalytics: StepStatus;
}
```

## Implementation Strategy
1. Validate all data before submission
2. Create profile record in transaction
3. Batch insert preferences
4. Update allowlist status
5. Trigger welcome email
6. Sync to analytics platform

## Error Handling
- Network timeout: Queue for retry
- Validation error: Return to form
- Duplicate profile: Merge strategy
- Partial failure: Rollback transaction
- Server error: Exponential backoff

## Offline Support
```typescript
interface OfflineQueue {
  addSubmission(data: OnboardingData): Promise<string>;
  processPendingSubmissions(): Promise<void>;
  getQueueStatus(): QueueStatus;
  clearQueue(): Promise<void>;
}
```

## Acceptance Criteria
- [ ] Submission completes in under 3 seconds
- [ ] Offline submissions queue properly
- [ ] Retry logic handles network issues
- [ ] Progress updates in real-time
- [ ] Rollback works on failure
- [ ] Audit log captures all attempts

## Where to Create
- `packages/mobile-app/src/services/onboardingSubmission.ts`
- `packages/mobile-app/src/hooks/useOnboardingSubmission.ts`
- `packages/shared/src/types/submission.ts`

## Monitoring & Analytics
- Submission success rate
- Average submission time
- Retry attempt metrics
- Failure reason breakdown
- Queue depth monitoring

## Estimated Effort
3 hours