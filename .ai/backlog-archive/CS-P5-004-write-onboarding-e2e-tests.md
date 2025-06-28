# Task: Write Onboarding E2E Tests

**ID:** CS-P5-004  
**Phase:** Testing & Deployment  
**Dependencies:** CS-P5-002, CS-P2-015

## Objective
Create comprehensive end-to-end tests for the mobile app onboarding flow, covering all screens, form validations, data persistence, navigation patterns, and edge cases.

## Context
The onboarding flow is crucial for new user experience and data collection. E2E tests must verify that all steps work correctly, data persists across screens, tier-based features display properly, and the submission process completes successfully. Tests should handle various user paths including forward, backward navigation, and error recovery.

## Requirements
- Test all onboarding screens
- Validate form inputs
- Test navigation patterns
- Verify data persistence
- Test tier-based features
- Validate submission process

## Technical Guidance
- Use page object pattern
- Test data factories
- Mock API responses
- Handle async operations
- Test offline scenarios
- Verify accessibility

## Test Structure
```javascript
// e2e/tests/onboarding/onboarding-flow.test.js
const OnboardingScreens = require('../../screens/OnboardingScreens');
const { createTestUser, createTestPreferences } = require('../../helpers/testDataFactory');
const { mockSupabaseResponses } = require('../../helpers/apiMocks');

describe('Onboarding Flow - Complete Journey', () => {
  let onboarding;
  let testUser;
  let testPreferences;
  
  beforeAll(async () => {
    onboarding = new OnboardingScreens();
    testUser = createTestUser({ tier: 'gold' });
    testPreferences = createTestPreferences(testUser.tier);
    
    // Setup API mocks
    await mockSupabaseResponses({
      allowlist: { [testUser.email]: { tier: testUser.tier } },
      preferences: {}
    });
  });
  
  beforeEach(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {
        notifications: 'YES',
        camera: 'YES',
        photos: 'YES'
      },
      launchArgs: {
        testMode: true,
        skipAnimations: true
      }
    });
    
    // Start onboarding
    await element(by.id('email-input')).typeText(testUser.email);
    await element(by.id('continue-button')).tap();
    await waitFor(element(by.id('onboarding-welcome')))
      .toBeVisible()
      .withTimeout(5000);
  });
  
  describe('Welcome Screen', () => {
    it('should display personalized welcome message', async () => {
      await expect(element(by.id('welcome-title')))
        .toHaveText(`Welcome to ClientSync`);
      
      await expect(element(by.id('tier-badge')))
        .toHaveText('Gold Member');
      
      await expect(element(by.id('onboarding-steps-preview')))
        .toBeVisible();
    });
    
    it('should show correct number of steps', async () => {
      const steps = await element(by.id('step-indicators')).getAttributes();
      expect(steps.elements.length).toBe(6); // Including review step
    });
    
    it('should navigate to first step', async () => {
      await element(by.id('start-onboarding-button')).tap();
      
      await expect(element(by.id('personal-details-screen')))
        .toBeVisible();
      
      await expect(element(by.id('progress-indicator')))
        .toHaveLabel('Step 1 of 6');
    });
  });
  
  describe('Personal Details Screen', () => {
    beforeEach(async () => {
      await element(by.id('start-onboarding-button')).tap();
    });
    
    it('should validate required fields', async () => {
      // Try to proceed without filling fields
      await element(by.id('next-button')).tap();
      
      // Check validation messages
      await expect(element(by.id('first-name-error')))
        .toHaveText('First name is required');
      
      await expect(element(by.id('last-name-error')))
        .toHaveText('Last name is required');
      
      await expect(element(by.id('phone-error')))
        .toHaveText('Phone number is required');
    });
    
    it('should validate phone number format', async () => {
      await element(by.id('phone-input')).typeText('123');
      await element(by.id('next-button')).tap();
      
      await expect(element(by.id('phone-error')))
        .toHaveText('Please enter a valid phone number');
    });
    
    it('should format phone number as typed', async () => {
      await element(by.id('phone-input')).typeText('5551234567');
      
      // Verify formatted display
      await expect(element(by.id('phone-input')))
        .toHaveText('(555) 123-4567');
    });
    
    it('should handle international phone numbers', async () => {
      // Open country picker
      await element(by.id('country-code-picker')).tap();
      await element(by.text('United Kingdom (+44)')).tap();
      
      await element(by.id('phone-input')).typeText('7911123456');
      
      await expect(element(by.id('phone-input')))
        .toHaveText('+44 7911 123456');
    });
    
    it('should validate date of birth (18+ requirement)', async () => {
      await element(by.id('dob-picker')).tap();
      
      // Select date less than 18 years ago
      const underageDate = new Date();
      underageDate.setFullYear(underageDate.getFullYear() - 17);
      
      if (device.getPlatform() === 'ios') {
        await element(by.type('UIDatePicker'))
          .setDatePickerDate(underageDate.toISOString(), 'yyyy-MM-dd');
      } else {
        // Android date picker
        await element(by.id('date-picker-year')).tap();
        await element(by.text(underageDate.getFullYear().toString())).tap();
        await element(by.text('OK')).tap();
      }
      
      await element(by.id('next-button')).tap();
      
      await expect(element(by.id('dob-error')))
        .toHaveText('You must be 18 or older');
    });
    
    it('should show tier-specific fields for Platinum', async () => {
      // Re-launch as Platinum user
      await device.launchApp({
        newInstance: true,
        launchArgs: { userTier: 'platinum' }
      });
      
      await onboarding.navigateToPersonalDetails();
      
      // Platinum-specific fields should be visible
      await expect(element(by.id('passport-number-input')))
        .toBeVisible();
      
      await expect(element(by.id('global-entry-input')))
        .toBeVisible();
    });
    
    it('should save and persist data on navigation', async () => {
      // Fill form
      await element(by.id('first-name-input')).typeText('John');
      await element(by.id('last-name-input')).typeText('Doe');
      await element(by.id('phone-input')).typeText('5551234567');
      
      // Navigate forward
      await element(by.id('next-button')).tap();
      
      // Navigate back
      await element(by.id('back-button')).tap();
      
      // Verify data persisted
      await expect(element(by.id('first-name-input')))
        .toHaveText('John');
      await expect(element(by.id('last-name-input')))
        .toHaveText('Doe');
      await expect(element(by.id('phone-input')))
        .toHaveText('(555) 123-4567');
    });
  });
  
  describe('Flight Preferences Screen', () => {
    beforeEach(async () => {
      await onboarding.navigateToFlightPreferences();
    });
    
    it('should display tier-appropriate cabin classes', async () => {
      // For Gold tier
      await expect(element(by.id('cabin-economy'))).toBeVisible();
      await expect(element(by.id('cabin-premium-economy'))).toBeVisible();
      await expect(element(by.id('cabin-business'))).toBeVisible();
      
      // First class should be disabled
      await expect(element(by.id('cabin-first')))
        .toHaveLabel('First Class - Available for Platinum members');
      
      await element(by.id('cabin-first')).tap();
      await expect(element(by.id('cabin-business')))
        .toHaveLabel('Selected'); // Should not change selection
    });
    
    it('should handle airline multi-selection', async () => {
      await element(by.id('airline-selector')).tap();
      
      // Search and select airlines
      await element(by.id('airline-search')).typeText('Delta');
      await element(by.text('Delta Air Lines')).tap();
      
      await element(by.id('airline-search')).clearText();
      await element(by.id('airline-search')).typeText('United');
      await element(by.text('United Airlines')).tap();
      
      await element(by.id('done-button')).tap();
      
      // Verify selections
      await expect(element(by.id('selected-airlines')))
        .toHaveText('Delta Air Lines, United Airlines');
    });
    
    it('should validate at least one airline selected', async () => {
      // Try to proceed without selecting airlines
      await element(by.id('next-button')).tap();
      
      await expect(element(by.id('airline-error')))
        .toHaveText('Please select at least one preferred airline');
    });
    
    it('should save frequent flyer information', async () => {
      // Add frequent flyer program
      await element(by.id('add-ff-button')).tap();
      
      await element(by.id('ff-airline-0')).tap();
      await element(by.text('American Airlines')).tap();
      
      await element(by.id('ff-number-0')).typeText('AA123456789');
      
      // Add another
      await element(by.id('add-ff-button')).tap();
      await element(by.id('ff-airline-1')).tap();
      await element(by.text('Delta Air Lines')).tap();
      await element(by.id('ff-number-1')).typeText('DL987654321');
      
      // Verify persistence
      await element(by.id('next-button')).tap();
      await element(by.id('back-button')).tap();
      
      await expect(element(by.id('ff-number-0')))
        .toHaveText('AA123456789');
      await expect(element(by.id('ff-number-1')))
        .toHaveText('DL987654321');
    });
  });
  
  describe('Hotel Preferences Screen', () => {
    beforeEach(async () => {
      await onboarding.navigateToHotelPreferences();
    });
    
    it('should display tier-appropriate hotel categories', async () => {
      // For Gold tier
      await expect(element(by.id('hotel-4-star'))).toBeVisible();
      await expect(element(by.id('hotel-5-star'))).toBeVisible();
      await expect(element(by.id('hotel-boutique'))).toBeVisible();
      
      // Luxury should be disabled for Gold
      await expect(element(by.id('hotel-luxury')))
        .toHaveLabel('Luxury Hotels - Available for Platinum members');
    });
    
    it('should handle amenity selection', async () => {
      // Essential amenities
      await element(by.id('amenity-wifi')).tap();
      await element(by.id('amenity-parking')).tap();
      await element(by.id('amenity-gym')).tap();
      
      // Preferred amenities
      await element(by.id('amenities-tab-preferred')).tap();
      await element(by.id('amenity-pool')).tap();
      await element(by.id('amenity-spa')).tap();
      
      // Verify selections persist
      await element(by.id('amenities-tab-essential')).tap();
      await expect(element(by.id('amenity-wifi-check'))).toBeVisible();
      await expect(element(by.id('amenity-parking-check'))).toBeVisible();
    });
    
    it('should validate room preferences', async () => {
      // Select conflicting preferences
      await element(by.id('bed-type-twin')).tap();
      await element(by.id('room-type-honeymoon-suite')).tap();
      
      await element(by.id('next-button')).tap();
      
      // Should show warning
      await expect(element(by.id('preference-warning')))
        .toHaveText('Twin beds may not be available in honeymoon suites');
    });
  });
  
  describe('Activities & Dining Preferences', () => {
    beforeEach(async () => {
      await onboarding.navigateToActivitiesPreferences();
    });
    
    it('should handle activity intensity preferences', async () => {
      // Set intensity level
      await element(by.id('intensity-slider')).swipe('right', 'slow', 0.7);
      
      await expect(element(by.id('intensity-label')))
        .toHaveText('Active');
      
      // Verify it affects suggestions
      await expect(element(by.id('suggested-activities')))
        .toContainText('Hiking');
      await expect(element(by.id('suggested-activities')))
        .toContainText('Cycling Tours');
    });
    
    it('should handle dietary restrictions in dining preferences', async () => {
      await onboarding.navigateToDiningPreferences();
      
      // Select allergies
      await element(by.id('allergy-search')).typeText('peanut');
      await element(by.text('Peanuts')).tap();
      
      await element(by.id('allergy-severity-severe')).tap();
      
      // Add medical dietary need
      await element(by.id('medical-diet-diabetes')).tap();
      
      // Verify critical allergies highlighted
      await expect(element(by.id('critical-allergies-warning')))
        .toBeVisible();
      await expect(element(by.id('critical-allergies-warning')))
        .toHaveText('Severe peanut allergy will be highlighted on all reservations');
    });
  });
  
  describe('Review & Submit Screen', () => {
    beforeEach(async () => {
      await onboarding.completeAllSteps(testPreferences);
      await onboarding.navigateToReviewScreen();
    });
    
    it('should display all entered information', async () => {
      // Personal details section
      await expect(element(by.id('review-name')))
        .toHaveText(`${testUser.firstName} ${testUser.lastName}`);
      
      // Scroll to see more sections
      await element(by.id('review-scroll')).scrollTo('bottom');
      
      // Verify each section has data
      const sections = ['personal', 'flight', 'hotel', 'activities', 'dining'];
      for (const section of sections) {
        await expect(element(by.id(`review-${section}-complete`)))
          .toBeVisible();
      }
    });
    
    it('should allow editing from review screen', async () => {
      // Edit personal details
      await element(by.id('edit-personal-details')).tap();
      
      // Should navigate to personal details with data
      await expect(element(by.id('personal-details-screen'))).toBeVisible();
      await expect(element(by.id('first-name-input')))
        .toHaveText(testUser.firstName);
      
      // Make change
      await element(by.id('first-name-input')).clearText();
      await element(by.id('first-name-input')).typeText('Jonathan');
      
      // Return to review
      await onboarding.navigateToReviewScreen();
      
      // Verify change reflected
      await expect(element(by.id('review-name')))
        .toHaveText(`Jonathan ${testUser.lastName}`);
    });
    
    it('should require consent before submission', async () => {
      // Try to submit without consent
      await element(by.id('submit-button')).tap();
      
      await expect(element(by.id('consent-error')))
        .toHaveText('Please accept the terms and privacy policy');
      
      // Accept terms
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('privacy-checkbox')).tap();
      
      // Submit button should be enabled
      await expect(element(by.id('submit-button')))
        .toHaveLabel('Submit Profile');
    });
    
    it('should handle submission with loading state', async () => {
      // Accept terms
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('privacy-checkbox')).tap();
      
      // Submit
      await element(by.id('submit-button')).tap();
      
      // Should show loading
      await expect(element(by.id('submission-loading'))).toBeVisible();
      await expect(element(by.text('Creating your profile...'))).toBeVisible();
      
      // Wait for success
      await waitFor(element(by.id('onboarding-complete')))
        .toBeVisible()
        .withTimeout(10000);
      
      // Should navigate to main app
      await element(by.id('continue-to-app')).tap();
      await expect(element(by.id('trip-list-screen'))).toBeVisible();
    });
    
    it('should handle submission errors gracefully', async () => {
      // Mock submission failure
      await device.launchApp({
        launchArgs: { mockSubmissionError: true }
      });
      
      await onboarding.completeAllSteps(testPreferences);
      await onboarding.navigateToReviewScreen();
      await onboarding.acceptTermsAndSubmit();
      
      // Should show error
      await expect(element(by.id('submission-error')))
        .toBeVisible();
      await expect(element(by.text('Failed to save profile. Please try again.')))
        .toBeVisible();
      
      // Should allow retry
      await element(by.id('retry-button')).tap();
      
      // Mock success on retry
      await device.launchApp({
        launchArgs: { mockSubmissionError: false }
      });
      
      await waitFor(element(by.id('onboarding-complete')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });
  
  describe('Offline Handling', () => {
    it('should save progress offline and sync when online', async () => {
      await onboarding.navigateToPersonalDetails();
      await onboarding.fillPersonalDetails(testUser);
      
      // Go offline
      await device.setURLBlacklist(['.*']);
      
      // Continue filling forms offline
      await element(by.id('next-button')).tap();
      await onboarding.fillFlightPreferences(testPreferences.flight);
      
      // Should save locally
      await expect(element(by.id('offline-indicator'))).toBeVisible();
      
      // Go back online
      await device.clearURLBlacklist();
      
      // Continue to submission
      await onboarding.completeRemainingSteps();
      await onboarding.submitProfile();
      
      // Should sync and complete successfully
      await expect(element(by.id('onboarding-complete'))).toBeVisible();
    });
  });
});
```

## Screen Object Enhancements
```javascript
// e2e/screens/OnboardingScreens.js
class OnboardingScreens {
  async completeAllSteps(preferences) {
    await this.fillPersonalDetails(preferences.personal);
    await element(by.id('next-button')).tap();
    
    await this.fillFlightPreferences(preferences.flight);
    await element(by.id('next-button')).tap();
    
    await this.fillHotelPreferences(preferences.hotel);
    await element(by.id('next-button')).tap();
    
    await this.fillActivityPreferences(preferences.activities);
    await element(by.id('next-button')).tap();
    
    await this.fillDiningPreferences(preferences.dining);
    await element(by.id('next-button')).tap();
  }
  
  async fillPersonalDetails(details) {
    await element(by.id('first-name-input')).typeText(details.firstName);
    await element(by.id('last-name-input')).typeText(details.lastName);
    await element(by.id('phone-input')).typeText(details.phone);
    
    // Date of birth
    await element(by.id('dob-picker')).tap();
    await this.selectDate(details.dateOfBirth);
    
    // Emergency contact
    await element(by.id('emergency-name-input')).typeText(details.emergencyContact.name);
    await element(by.id('emergency-phone-input')).typeText(details.emergencyContact.phone);
    await element(by.id('emergency-relationship')).tap();
    await element(by.text(details.emergencyContact.relationship)).tap();
  }
  
  async fillFlightPreferences(preferences) {
    // Cabin class
    await element(by.id(`cabin-${preferences.cabinClass}`)).tap();
    
    // Airlines
    await element(by.id('airline-selector')).tap();
    for (const airline of preferences.airlines) {
      await element(by.id('airline-search')).typeText(airline);
      await element(by.text(airline)).atIndex(0).tap();
      await element(by.id('airline-search')).clearText();
    }
    await element(by.id('done-button')).tap();
    
    // Seat preference
    await element(by.id(`seat-${preferences.seatPreference}`)).tap();
    
    // Meal preference
    await element(by.id('meal-preference')).tap();
    await element(by.text(preferences.mealPreference)).tap();
  }
  
  async acceptTermsAndSubmit() {
    await element(by.id('review-scroll')).scrollTo('bottom');
    await element(by.id('terms-checkbox')).tap();
    await element(by.id('privacy-checkbox')).tap();
    await element(by.id('submit-button')).tap();
  }
  
  // Navigation helpers
  async navigateToPersonalDetails() {
    await element(by.id('start-onboarding-button')).tap();
  }
  
  async navigateToFlightPreferences() {
    await this.navigateToPersonalDetails();
    await this.fillPersonalDetails(createTestUser());
    await element(by.id('next-button')).tap();
  }
  
  async navigateToReviewScreen() {
    // Navigate through all screens to review
    let currentScreen = await this.getCurrentScreen();
    while (currentScreen !== 'review-screen') {
      await element(by.id('next-button')).tap();
      currentScreen = await this.getCurrentScreen();
    }
  }
  
  async getCurrentScreen() {
    const screens = [
      'personal-details-screen',
      'flight-preferences-screen',
      'hotel-preferences-screen',
      'activities-screen',
      'dining-screen',
      'review-screen'
    ];
    
    for (const screen of screens) {
      try {
        await expect(element(by.id(screen))).toBeVisible();
        return screen;
      } catch (e) {
        // Continue checking
      }
    }
    
    return null;
  }
}

module.exports = OnboardingScreens;
```

## Test Data Factory
```javascript
// e2e/helpers/testDataFactory.js
const faker = require('faker');

function createTestUser(overrides = {}) {
  const tier = overrides.tier || 'gold';
  
  return {
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    phone: faker.phone.phoneNumber('##########'),
    dateOfBirth: faker.date.between('1960-01-01', '2000-01-01'),
    tier,
    emergencyContact: {
      name: faker.name.findName(),
      phone: faker.phone.phoneNumber('##########'),
      relationship: faker.random.arrayElement(['Spouse', 'Parent', 'Sibling', 'Friend'])
    },
    ...overrides
  };
}

function createTestPreferences(tier = 'gold') {
  const tierConfig = {
    silver: {
      cabinClass: 'economy',
      hotelCategories: ['3-star', '4-star'],
      maxActivities: 3
    },
    gold: {
      cabinClass: 'business',
      hotelCategories: ['4-star', '5-star', 'boutique'],
      maxActivities: 5
    },
    platinum: {
      cabinClass: 'first',
      hotelCategories: ['5-star', 'luxury', 'boutique'],
      maxActivities: 10
    }
  };
  
  const config = tierConfig[tier];
  
  return {
    personal: createTestUser({ tier }),
    flight: {
      cabinClass: config.cabinClass,
      airlines: ['Delta Air Lines', 'American Airlines'],
      seatPreference: 'aisle',
      mealPreference: 'Regular',
      frequentFlyer: []
    },
    hotel: {
      categories: config.hotelCategories,
      bedType: 'king',
      roomType: 'suite',
      amenities: {
        essential: ['wifi', 'parking', 'gym'],
        preferred: ['pool', 'spa']
      }
    },
    activities: {
      intensity: 'moderate',
      interests: ['cultural', 'culinary', 'nature'],
      groupSize: 'small',
      maxDaily: config.maxActivities
    },
    dining: {
      restrictions: [],
      cuisinePreferences: {
        loved: ['Italian', 'Japanese', 'Mediterranean'],
        disliked: ['Fast Food']
      },
      mealTimes: {
        breakfast: '08:00',
        lunch: '12:30',
        dinner: '19:00'
      }
    }
  };
}

module.exports = {
  createTestUser,
  createTestPreferences
};
```

## Acceptance Criteria
- [ ] All screens test successfully
- [ ] Form validations work correctly
- [ ] Navigation patterns verified
- [ ] Data persistence confirmed
- [ ] Tier features display properly
- [ ] Submission process completes

## Where to Create
- `packages/mobile-app/e2e/tests/onboarding/`
- Enhanced screen objects in `e2e/screens/`
- Test data factories in `e2e/helpers/`

## Test Coverage Goals
- Screen navigation: 100%
- Form validation: 100%
- Data persistence: 90%
- Error handling: 85%
- Tier-specific features: 100%
- Offline scenarios: 80%

## Estimated Effort
3.5 hours