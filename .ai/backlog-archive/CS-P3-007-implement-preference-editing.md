# Task: Implement Preference Editing Flows

**ID:** CS-P3-007  
**Phase:** Trip Management  
**Dependencies:** CS-P3-006, CS-P2-006 through CS-P2-012

## Objective
Create edit screens for each preference category, allowing users to modify their travel preferences post-onboarding with proper validation and persistence.

## Context
Users need the ability to update their preferences as their travel needs change. The edit flows should reuse components from onboarding while providing a streamlined experience for updating specific sections without going through the entire flow.

## Requirements
- Individual edit screens per category
- Pre-populated with current preferences
- Validation before saving
- Optimistic updates
- Success/error feedback
- Navigation back to profile

## Technical Guidance
- Reuse onboarding form components
- Implement with Expo Router routes
- Use React Hook Form
- Apply optimistic mutations
- Handle conflict resolution
- Show loading states

## Route Structure
```typescript
// Routes under /profile/edit/
interface EditRoutes {
  '/profile/edit/personal': PersonalDetailsEdit;
  '/profile/edit/flights': FlightPreferencesEdit;
  '/profile/edit/hotels': HotelPreferencesEdit;
  '/profile/edit/activities': ActivitiesPreferencesEdit;
  '/profile/edit/dining': DiningPreferencesEdit;
}

interface EditScreenProps {
  initialData: PreferenceData;
  onSave: (data: PreferenceData) => Promise<void>;
  onCancel: () => void;
}
```

## Screen Template
```typescript
const PreferenceEditTemplate = <T extends PreferenceData>({
  title,
  initialData,
  schema,
  children,
  onSave
}: EditTemplateProps<T>) => {
  const form = useForm<T>({
    defaultValues: initialData,
    resolver: zodResolver(schema)
  });
  
  const mutation = useMutation({
    mutationFn: onSave,
    onSuccess: () => {
      toast.success('Preferences updated');
      router.back();
    },
    onError: (error) => {
      toast.error('Failed to update preferences');
    }
  });
  
  return (
    <SafeAreaView>
      <Header
        title={title}
        leftAction={{ label: 'Cancel', onPress: router.back }}
        rightAction={{ 
          label: 'Save', 
          onPress: form.handleSubmit(mutation.mutate),
          loading: mutation.isLoading
        }}
      />
      <ScrollView>
        <FormProvider {...form}>
          {children}
        </FormProvider>
      </ScrollView>
    </SafeAreaView>
  );
};
```

## Implementation per Category

### Personal Details Edit
- Name, phone, emergency contact
- Validation for phone formats
- Update user profile API

### Flight Preferences Edit
- Cabin class (tier-restricted)
- Airline preferences
- Seat selections
- Frequent flyer updates

### Hotel Preferences Edit
- Category selection
- Amenity preferences
- Loyalty program management

### Activities Edit
- Interest level adjustments
- Intensity preferences
- Accessibility updates

### Dining Edit
- Dietary restrictions
- Cuisine preferences
- Allergy management

## State Management
```typescript
const usePreferenceEdit = <T>(
  category: PreferenceCategory,
  initialData: T
) => {
  const queryClient = useQueryClient();
  
  const updatePreference = async (data: T) => {
    // Optimistic update
    queryClient.setQueryData(['preferences', category], data);
    
    try {
      await api.updatePreference(category, data);
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(['preferences', category], initialData);
      throw error;
    }
  };
  
  return { updatePreference };
};
```

## Acceptance Criteria
- [ ] All preference categories editable
- [ ] Current data pre-populates
- [ ] Validation matches onboarding
- [ ] Save updates immediately
- [ ] Error handling works
- [ ] Navigation flows smoothly

## Where to Create
- Edit screens in `packages/mobile-app/src/app/(app)/profile/edit/[category].tsx`
- Shared template in `src/components/profile/PreferenceEditTemplate.tsx`
- Hooks in `src/hooks/usePreferenceEdit.ts`

## UX Considerations
- Unsaved changes warning
- Loading states during save
- Success feedback
- Error recovery options
- Consistent with onboarding

## Estimated Effort
3 hours