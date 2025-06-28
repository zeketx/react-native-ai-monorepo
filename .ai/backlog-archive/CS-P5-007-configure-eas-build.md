# Task: Configure EAS Build for Mobile App

**ID:** CS-P5-007  
**Phase:** Testing & Deployment  
**Dependencies:** CS-P3-008

## Objective
Configure Expo Application Services (EAS) Build for automated building and deployment of the React Native app to iOS App Store and Google Play Store, including proper signing, environment configuration, and CI/CD integration.

## Context
EAS Build provides cloud-based building services for React Native apps, eliminating the need for local build environments. The configuration must handle multiple build profiles (development, preview, production), manage secrets securely, and integrate with the deployment pipeline for automated releases.

## Requirements
- EAS Build configuration
- iOS signing setup
- Android signing setup
- Environment variable management
- Build profiles configuration
- CI/CD integration

## Technical Guidance
- Configure eas.json
- Set up credentials
- Create build profiles
- Manage environment variables
- Configure auto-submit
- Set up webhooks

## EAS Configuration
```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0",
    "requireCommit": true
  },
  "build": {
    "base": {
      "node": "18.18.0",
      "env": {
        "EXPO_PUBLIC_APP_VARIANT": "production"
      }
    },
    "development": {
      "extends": "base",
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_APP_VARIANT": "development",
        "EXPO_PUBLIC_API_URL": "https://dev-api.clientsync.com"
      },
      "ios": {
        "simulator": true,
        "enterpriseProvisioning": "adhoc"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "extends": "base",
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_APP_VARIANT": "preview",
        "EXPO_PUBLIC_API_URL": "https://staging-api.clientsync.com"
      },
      "ios": {
        "enterpriseProvisioning": "adhoc"
      },
      "android": {
        "buildType": "apk"
      },
      "channel": "preview"
    },
    "production": {
      "extends": "base",
      "env": {
        "EXPO_PUBLIC_APP_VARIANT": "production",
        "EXPO_PUBLIC_API_URL": "https://api.clientsync.com"
      },
      "ios": {
        "autoIncrement": true,
        "enterpriseProvisioning": "universal"
      },
      "android": {
        "autoIncrement": true,
        "buildType": "app-bundle"
      },
      "channel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "support@clientsync.com",
        "ascAppId": "1234567890",
        "appleTeamId": "TEAM123456"
      },
      "android": {
        "serviceAccountKeyPath": "./credentials/google-play-service-account.json",
        "track": "internal",
        "releaseStatus": "draft"
      }
    }
  }
}
```

## Build Configuration
```javascript
// app.config.js
export default ({ config }) => {
  const IS_DEV = process.env.EXPO_PUBLIC_APP_VARIANT === 'development';
  const IS_PREVIEW = process.env.EXPO_PUBLIC_APP_VARIANT === 'preview';
  
  return {
    ...config,
    name: IS_DEV ? 'ClientSync Dev' : config.name,
    slug: config.slug,
    version: config.version,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    
    updates: {
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/project-id',
      enabled: !IS_DEV
    },
    
    assetBundlePatterns: ['**/*'],
    
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_DEV 
        ? 'com.clientsync.app.dev'
        : IS_PREVIEW 
          ? 'com.clientsync.app.preview'
          : 'com.clientsync.app',
      buildNumber: process.env.EAS_BUILD_BUILD_NUMBER || '1',
      config: {
        usesNonExemptEncryption: false
      },
      infoPlist: {
        NSCameraUsageDescription: 'This app uses the camera to scan documents.',
        NSPhotoLibraryUsageDescription: 'This app needs access to photo library to upload documents.',
        NSLocationWhenInUseUsageDescription: 'This app uses location for travel planning features.'
      },
      entitlements: {
        'com.apple.developer.applesignin': ['Default']
      }
    },
    
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF'
      },
      package: IS_DEV 
        ? 'com.clientsync.app.dev'
        : IS_PREVIEW 
          ? 'com.clientsync.app.preview'
          : 'com.clientsync.app',
      versionCode: parseInt(process.env.EAS_BUILD_BUILD_NUMBER || '1'),
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'ACCESS_FINE_LOCATION'
      ],
      intentFilters: [
        {
          action: 'VIEW',
          category: ['BROWSABLE', 'DEFAULT'],
          data: {
            scheme: 'clientsync',
            host: 'app'
          }
        }
      ]
    },
    
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro'
    },
    
    plugins: [
      'expo-localization',
      'expo-notifications',
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '13.0',
            useFrameworks: 'static'
          },
          android: {
            compileSdkVersion: 33,
            targetSdkVersion: 33,
            buildToolsVersion: '33.0.0'
          }
        }
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#ffffff'
        }
      ]
    ],
    
    extra: {
      eas: {
        projectId: 'your-project-id'
      },
      sentryDsn: process.env.SENTRY_DSN,
      oneSignalAppId: process.env.ONESIGNAL_APP_ID
    }
  };
};
```

## Environment Configuration
```bash
# .env.production
EXPO_PUBLIC_APP_VARIANT=production
EXPO_PUBLIC_API_URL=https://api.clientsync.com
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Secrets (stored in EAS)
SENTRY_DSN=https://xxx@sentry.io/xxx
ONESIGNAL_APP_ID=xxx-xxx-xxx
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

## Credentials Setup Script
```bash
#!/bin/bash
# scripts/setup-eas-credentials.sh

echo "Setting up EAS Build credentials..."

# Login to EAS
eas login

# Configure iOS credentials
echo "Configuring iOS credentials..."
eas credentials:configure \
  --platform ios \
  --profile production

# Configure Android credentials
echo "Configuring Android credentials..."
eas credentials:configure \
  --platform android \
  --profile production

# Set up environment variables
echo "Setting up environment variables..."
eas secret:create --scope project --name SENTRY_DSN
eas secret:create --scope project --name ONESIGNAL_APP_ID
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY

echo "EAS credentials setup complete!"
```

## CI/CD Integration
```yaml
# .github/workflows/eas-build.yml
name: EAS Build

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    types: [opened, synchronize]

jobs:
  build:
    name: EAS Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Build on EAS
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            eas build --platform all --profile production --non-interactive
          elif [[ "${{ github.ref }}" == "refs/heads/develop" ]]; then
            eas build --platform all --profile preview --non-interactive
          else
            eas build --platform all --profile development --non-interactive
          fi
          
      - name: Submit to stores (production only)
        if: github.ref == 'refs/heads/main'
        run: |
          eas submit --platform ios --profile production --non-interactive
          eas submit --platform android --profile production --non-interactive
```

## Build Hooks
```javascript
// scripts/eas-build-pre-install.sh
#!/bin/bash
# Runs before dependencies are installed

echo "Running pre-install hook..."

# Set up environment
if [ "$EAS_BUILD_PROFILE" = "production" ]; then
  echo "Setting up production environment..."
  cp .env.production .env
elif [ "$EAS_BUILD_PROFILE" = "preview" ]; then
  echo "Setting up preview environment..."
  cp .env.preview .env
else
  echo "Setting up development environment..."
  cp .env.development .env
fi

# Generate app config
node scripts/generate-app-config.js
```

## Build Status Monitoring
```typescript
// src/services/buildMonitor.ts
import { EASBuildStatus } from '@expo/eas-build-status';

export class BuildMonitor {
  private webhookUrl: string;
  
  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }
  
  async handleBuildComplete(build: EASBuildStatus) {
    const { id, platform, status, artifacts } = build;
    
    if (status === 'finished') {
      // Notify team
      await this.sendNotification({
        title: `Build ${id} completed`,
        message: `${platform} build finished successfully`,
        url: artifacts?.buildUrl,
      });
      
      // Trigger automated tests
      if (build.profile === 'preview') {
        await this.triggerE2ETests(artifacts?.buildUrl);
      }
      
      // Update deployment tracking
      await this.updateDeploymentStatus({
        buildId: id,
        platform,
        status: 'ready',
        artifactUrl: artifacts?.buildUrl,
      });
    } else if (status === 'errored') {
      // Alert on failure
      await this.sendAlert({
        title: `Build ${id} failed`,
        message: `${platform} build failed: ${build.error?.message}`,
        severity: 'high',
      });
    }
  }
  
  async triggerE2ETests(buildUrl: string) {
    // Trigger Detox tests with new build
    await fetch(`${process.env.CI_API}/trigger-e2e`, {
      method: 'POST',
      body: JSON.stringify({ buildUrl }),
    });
  }
}
```

## Submission Configuration
```javascript
// scripts/prepare-submission.js
const fs = require('fs');
const path = require('path');

async function prepareSubmission() {
  const config = {
    ios: {
      // App Store metadata
      releaseNotes: {
        'en-US': fs.readFileSync('./metadata/ios/release-notes.txt', 'utf8'),
      },
      keywords: {
        'en-US': ['travel', 'client management', 'itinerary'],
      },
      supportUrl: 'https://clientsync.com/support',
      marketingUrl: 'https://clientsync.com',
      privacyPolicyUrl: 'https://clientsync.com/privacy',
    },
    android: {
      // Google Play metadata
      releaseNotes: {
        'en-US': fs.readFileSync('./metadata/android/release-notes.txt', 'utf8'),
      },
      shortDescription: 'Manage your travel preferences and itineraries',
      fullDescription: fs.readFileSync('./metadata/android/description.txt', 'utf8'),
      video: 'https://youtube.com/watch?v=demo',
    },
  };
  
  // Write submission config
  fs.writeFileSync(
    './submission-config.json',
    JSON.stringify(config, null, 2)
  );
  
  // Prepare screenshots
  await prepareScreenshots();
  
  // Validate app icons
  await validateAppIcons();
}

async function prepareScreenshots() {
  const platforms = ['ios', 'android'];
  const devices = {
    ios: ['iphone-5.5', 'iphone-6.5', 'ipad-12.9'],
    android: ['phone', 'tablet-7', 'tablet-10'],
  };
  
  for (const platform of platforms) {
    for (const device of devices[platform]) {
      const screenshotPath = `./metadata/${platform}/screenshots/${device}`;
      
      if (!fs.existsSync(screenshotPath)) {
        console.warn(`Missing screenshots for ${platform}/${device}`);
      }
    }
  }
}
```

## Monitoring Dashboard Integration
```typescript
// src/hooks/useBuildStatus.ts
export const useBuildStatus = () => {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const response = await fetch('https://api.expo.dev/v2/projects/your-project/builds', {
          headers: {
            Authorization: `Bearer ${process.env.EXPO_TOKEN}`,
          },
        });
        
        const data = await response.json();
        setBuilds(data.builds);
      } catch (error) {
        console.error('Failed to fetch builds:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBuilds();
    
    // Poll for updates
    const interval = setInterval(fetchBuilds, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return { builds, loading };
};
```

## Acceptance Criteria
- [ ] EAS Build configures properly
- [ ] All profiles build successfully
- [ ] Credentials manage securely
- [ ] Environment variables work
- [ ] CI/CD integration functions
- [ ] Auto-submit works correctly

## Where to Create
- `packages/mobile-app/eas.json`
- `packages/mobile-app/app.config.js`
- Build scripts in `packages/mobile-app/scripts/`

## Build Checklist
- [ ] iOS certificates valid
- [ ] Android keystore secure
- [ ] Environment variables set
- [ ] Build numbers increment
- [ ] Metadata prepared
- [ ] Screenshots ready

## Estimated Effort
2.5 hours