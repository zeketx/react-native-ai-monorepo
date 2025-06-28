# Task: Setup Detox E2E Testing for Mobile

**ID:** CS-P5-002  
**Phase:** Testing & Deployment  
**Dependencies:** CS-P3-001

## Objective
Configure Detox for end-to-end testing of the React Native mobile app, enabling automated testing on iOS and Android simulators/emulators with reliable test execution and CI/CD integration.

## Context
Mobile E2E testing ensures the React Native app functions correctly across different devices and OS versions. Detox provides gray-box testing with deep integration into React Native, offering synchronization capabilities that reduce test flakiness. The setup must support both platforms and integrate with the existing development workflow.

## Requirements
- Detox installation and configuration
- iOS and Android test setup
- Test utilities and helpers
- Device configuration management
- CI/CD integration
- Test data synchronization

## Technical Guidance
- Install Detox with Jest
- Configure for Expo workflow
- Set up device configs
- Create test helpers
- Implement mocking strategies
- Configure for CI environments

## Project Structure
```
packages/mobile-app/
├── e2e/
│   ├── config/
│   │   ├── devices.json
│   │   └── testData.js
│   ├── helpers/
│   │   ├── actions.js
│   │   ├── assertions.js
│   │   └── navigation.js
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── OnboardingScreens.js
│   │   └── TripListScreen.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── onboarding.test.js
│   │   └── trips.test.js
│   ├── init.js
│   └── environment.js
├── .detoxrc.js
└── package.json
```

## Detox Configuration
```javascript
// .detoxrc.js
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupFilesAfterEnv: ['<rootDir>/e2e/init.js'],
      testEnvironment: '<rootDir>/e2e/environment.js'
    }
  },
  
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/ClientSync.app',
      build: 'xcodebuild -workspace ios/ClientSync.xcworkspace -scheme ClientSync -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/ClientSync.app',
      build: 'xcodebuild -workspace ios/ClientSync.xcworkspace -scheme ClientSync -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081]
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release'
    }
  },
  
  devices: {
    'ios.simulator': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14 Pro'
      }
    },
    'android.emulator': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_6_API_33'
      }
    }
  },
  
  configurations: {
    'ios.sim.debug': {
      device: 'ios.simulator',
      app: 'ios.debug'
    },
    'ios.sim.release': {
      device: 'ios.simulator',
      app: 'ios.release'
    },
    'android.emu.debug': {
      device: 'android.emulator',
      app: 'android.debug'
    },
    'android.emu.release': {
      device: 'android.emulator',
      app: 'android.release'
    }
  }
};
```

## Test Environment Setup
```javascript
// e2e/init.js
const detox = require('detox');
const config = require('../.detoxrc.js');
const { setupTestData, cleanupTestData } = require('./helpers/testData');

// Set longer timeout for E2E tests
jest.setTimeout(120000);

beforeAll(async () => {
  await detox.init(config);
  await device.launchApp({
    newInstance: true,
    permissions: {
      notifications: 'YES',
      location: 'always',
      camera: 'YES'
    },
    launchArgs: {
      detoxTest: true,
      detoxURLBlacklistRegex: '.*\\/logs.*' // Disable analytics
    }
  });
});

beforeEach(async () => {
  // Reset app state
  await device.reloadReactNative();
  
  // Setup test data
  await setupTestData();
});

afterEach(async () => {
  // Clean up test data
  await cleanupTestData();
  
  // Take screenshot on failure
  if (jasmine.currentTest.failedExpectations.length > 0) {
    await device.takeScreenshot(jasmine.currentTest.fullName);
  }
});

afterAll(async () => {
  await detox.cleanup();
});
```

## Test Helpers
```javascript
// e2e/helpers/actions.js
const actions = {
  async login(email, password) {
    await element(by.id('email-input')).typeText(email);
    await element(by.id('password-input')).typeText(password);
    await element(by.id('login-button')).tap();
    
    // Wait for navigation
    await waitFor(element(by.id('trip-list-screen')))
      .toBeVisible()
      .withTimeout(5000);
  },
  
  async logout() {
    await element(by.id('profile-tab')).tap();
    await element(by.id('logout-button')).tap();
    await element(by.text('Confirm')).tap();
  },
  
  async navigateToTab(tabName) {
    await element(by.id(`${tabName}-tab`)).tap();
  },
  
  async scrollToElement(testID, scrollViewID = 'main-scroll-view') {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .whileElement(by.id(scrollViewID))
      .scroll(500, 'down');
  },
  
  async typeInTextField(testID, text, shouldClear = true) {
    const textField = element(by.id(testID));
    
    if (shouldClear) {
      await textField.clearText();
    }
    
    await textField.typeText(text);
    
    // Dismiss keyboard
    if (device.getPlatform() === 'ios') {
      await element(by.id('main-scroll-view')).tap();
    } else {
      await device.pressBack();
    }
  },
  
  async selectFromPicker(pickerID, value) {
    await element(by.id(pickerID)).tap();
    
    if (device.getPlatform() === 'ios') {
      await element(by.type('UIPickerView')).setColumnToValue(0, value);
      await element(by.text('Done')).tap();
    } else {
      await element(by.text(value)).tap();
    }
  }
};

module.exports = actions;
```

## Screen Objects
```javascript
// e2e/screens/OnboardingScreens.js
class OnboardingScreens {
  async completePersonalDetails(userData) {
    await element(by.id('first-name-input')).typeText(userData.firstName);
    await element(by.id('last-name-input')).typeText(userData.lastName);
    await element(by.id('phone-input')).typeText(userData.phone);
    
    // Select date of birth
    await element(by.id('dob-picker')).tap();
    await this.selectDate(userData.dateOfBirth);
    
    // Emergency contact
    await element(by.id('emergency-name-input')).typeText(userData.emergencyContact.name);
    await element(by.id('emergency-phone-input')).typeText(userData.emergencyContact.phone);
    
    await element(by.id('next-button')).tap();
  }
  
  async completeFlightPreferences(preferences) {
    // Select cabin class
    await element(by.id(`cabin-class-${preferences.cabinClass}`)).tap();
    
    // Select airlines (multi-select)
    for (const airline of preferences.airlines) {
      await element(by.id('airline-search')).typeText(airline);
      await element(by.text(airline)).tap();
    }
    
    // Seat preference
    await element(by.id(`seat-${preferences.seatPreference}`)).tap();
    
    await element(by.id('next-button')).tap();
  }
  
  async reviewAndSubmit() {
    // Scroll through review screen
    await element(by.id('review-scroll-view')).scrollTo('bottom');
    
    // Accept terms
    await element(by.id('terms-checkbox')).tap();
    await element(by.id('privacy-checkbox')).tap();
    
    // Submit
    await element(by.id('submit-button')).tap();
    
    // Wait for success
    await waitFor(element(by.id('onboarding-success')))
      .toBeVisible()
      .withTimeout(10000);
  }
  
  async selectDate(dateString) {
    if (device.getPlatform() === 'ios') {
      // iOS date picker handling
      const date = new Date(dateString);
      await element(by.type('UIDatePicker')).setDatePickerDate(
        date.toISOString(),
        'yyyy-MM-dd'
      );
      await element(by.text('Done')).tap();
    } else {
      // Android date picker
      const [year, month, day] = dateString.split('-');
      await element(by.text('OK')).tap();
    }
  }
}

module.exports = OnboardingScreens;
```

## Example E2E Tests
```javascript
// e2e/tests/onboarding.test.js
const { login } = require('../helpers/actions');
const OnboardingScreens = require('../screens/OnboardingScreens');
const { testUsers, testPreferences } = require('../config/testData');

describe('Onboarding Flow', () => {
  const onboarding = new OnboardingScreens();
  
  beforeEach(async () => {
    // Login with unregistered user to trigger onboarding
    await login(testUsers.newUser.email, testUsers.newUser.password);
  });
  
  it('should complete full onboarding flow', async () => {
    // Personal Details
    await expect(element(by.id('personal-details-screen'))).toBeVisible();
    await onboarding.completePersonalDetails(testUsers.newUser.profile);
    
    // Flight Preferences
    await expect(element(by.id('flight-preferences-screen'))).toBeVisible();
    await onboarding.completeFlightPreferences(testPreferences.flight);
    
    // Hotel Preferences
    await expect(element(by.id('hotel-preferences-screen'))).toBeVisible();
    await onboarding.completeHotelPreferences(testPreferences.hotel);
    
    // Activities & Dining
    await expect(element(by.id('activities-screen'))).toBeVisible();
    await onboarding.completeActivitiesPreferences(testPreferences.activities);
    
    await expect(element(by.id('dining-screen'))).toBeVisible();
    await onboarding.completeDiningPreferences(testPreferences.dining);
    
    // Review & Submit
    await expect(element(by.id('review-screen'))).toBeVisible();
    await onboarding.reviewAndSubmit();
    
    // Verify navigation to main app
    await expect(element(by.id('trip-list-screen'))).toBeVisible();
  });
  
  it('should validate required fields', async () => {
    // Try to proceed without filling required fields
    await element(by.id('next-button')).tap();
    
    // Verify error messages
    await expect(element(by.text('First name is required'))).toBeVisible();
    await expect(element(by.text('Last name is required'))).toBeVisible();
    await expect(element(by.text('Phone number is required'))).toBeVisible();
  });
  
  it('should allow navigation back and retain data', async () => {
    // Fill personal details
    await element(by.id('first-name-input')).typeText('John');
    await element(by.id('last-name-input')).typeText('Doe');
    await element(by.id('next-button')).tap();
    
    // Go back
    await element(by.id('back-button')).tap();
    
    // Verify data is retained
    await expect(element(by.id('first-name-input'))).toHaveText('John');
    await expect(element(by.id('last-name-input'))).toHaveText('Doe');
  });
});
```

## Platform-Specific Tests
```javascript
// e2e/tests/platform-specific.test.js
describe('Platform Specific Features', () => {
  if (device.getPlatform() === 'ios') {
    it('should handle iOS-specific permissions', async () => {
      // Test iOS-specific notification permissions
      await element(by.id('enable-notifications-button')).tap();
      
      // Handle system alert
      await expect(element(by.label('Allow'))).toBeVisible();
      await element(by.label('Allow')).tap();
      
      // Verify permission granted
      await expect(element(by.id('notifications-enabled'))).toBeVisible();
    });
  }
  
  if (device.getPlatform() === 'android') {
    it('should handle Android back button', async () => {
      await element(by.id('trip-detail-link')).tap();
      
      // Use hardware back button
      await device.pressBack();
      
      // Verify navigation
      await expect(element(by.id('trip-list-screen'))).toBeVisible();
    });
  }
});
```

## CI/CD Configuration
```yaml
# .github/workflows/detox-tests.yml
name: Mobile E2E Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: |
          pnpm install
          brew tap wix/brew
          brew install applesimutils
          
      - name: Setup iOS environment
        run: |
          cd packages/mobile-app/ios
          pod install
          
      - name: Build iOS app
        run: |
          cd packages/mobile-app
          pnpm detox build --configuration ios.sim.release
          
      - name: Run iOS tests
        run: |
          cd packages/mobile-app
          pnpm detox test --configuration ios.sim.release --cleanup
          
      - name: Upload artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: detox-artifacts-ios
          path: packages/mobile-app/artifacts
          
  test-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: 11
          distribution: 'adopt'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Start Android emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 33
          target: google_apis
          arch: x86_64
          
      - name: Build Android app
        run: |
          cd packages/mobile-app
          pnpm detox build --configuration android.emu.release
          
      - name: Run Android tests
        run: |
          cd packages/mobile-app
          pnpm detox test --configuration android.emu.release --cleanup
```

## Acceptance Criteria
- [ ] Detox installs and configures
- [ ] iOS tests run successfully
- [ ] Android tests run successfully
- [ ] CI/CD pipeline executes
- [ ] Screenshots capture on failure
- [ ] Test reports generate

## Where to Create
- `packages/mobile-app/e2e/`
- `packages/mobile-app/.detoxrc.js`
- Update `package.json` with test scripts

## Performance Requirements
- Test execution < 20 min
- Parallel test support
- Stable test execution (< 5% flake rate)
- Device boot time < 2 min

## Estimated Effort
3.5 hours