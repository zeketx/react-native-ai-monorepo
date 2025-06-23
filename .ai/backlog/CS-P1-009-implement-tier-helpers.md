# Task: Implement Tier-Based Access Helpers

**ID:** CS-P1-009  
**Phase:** Authentication  
**Dependencies:** CS-P1-008

## Objective
Create additional tier-based helper components and hooks that make it easy to conditionally render content based on client tier throughout the application.

## Acceptance Criteria
- [ ] TierGate component restricts content by tier
- [ ] TierBadge component displays tier visually
- [ ] useTierFeatures hook provides feature flags
- [ ] Components handle loading and error states
- [ ] TypeScript types are properly defined

## Implementation Notes
1. Create TierGate component (packages/mobile-app/src/components/TierGate.tsx):
```typescript
import React, { ReactNode } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { ClientTier } from '@clientsync/shared'
import { useViewer, useTierAccess } from '../user/useViewerContext'
import { Ionicons } from '@expo/vector-icons'

interface TierGateProps {
  requiredTier: ClientTier
  children: ReactNode
  fallback?: ReactNode
  showUpgradePrompt?: boolean
}

export function TierGate({ 
  requiredTier, 
  children, 
  fallback,
  showUpgradePrompt = true 
}: TierGateProps) {
  const { tier, isLoading } = useViewer()
  const { hasAccessToTier } = useTierAccess()

  if (isLoading) {
    return null // Or a loading placeholder
  }

  if (hasAccessToTier(requiredTier)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showUpgradePrompt) {
    return (
      <UpgradePrompt 
        currentTier={tier} 
        requiredTier={requiredTier} 
      />
    )
  }

  return null
}

function UpgradePrompt({ 
  currentTier, 
  requiredTier 
}: { 
  currentTier: ClientTier | null
  requiredTier: ClientTier 
}) {
  const tierNames = {
    [ClientTier.STANDARD]: 'Standard',
    [ClientTier.PREMIUM]: 'Premium',
    [ClientTier.ELITE]: 'Elite'
  }

  return (
    <View className="bg-gray-50 rounded-lg p-4 m-4 border border-gray-200">
      <View className="flex-row items-center mb-2">
        <Ionicons name="lock-closed" size={20} color="#6B7280" />
        <Text className="text-gray-700 font-semibold ml-2">
          {tierNames[requiredTier]} Feature
        </Text>
      </View>
      <Text className="text-gray-600 mb-3">
        This feature is available for {tierNames[requiredTier]} tier members.
        {currentTier && ` You're currently on the ${tierNames[currentTier]} tier.`}
      </Text>
      <TouchableOpacity className="bg-blue-600 rounded-lg py-2 px-4">
        <Text className="text-white text-center font-medium">
          Contact Your Organizer
        </Text>
      </TouchableOpacity>
    </View>
  )
}
```

2. Create TierBadge component (packages/mobile-app/src/components/TierBadge.tsx):
```typescript
import React from 'react'
import { View, Text } from 'react-native'
import { ClientTier } from '@clientsync/shared'

interface TierBadgeProps {
  tier: ClientTier
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
}

export function TierBadge({ 
  tier, 
  size = 'medium',
  showLabel = true 
}: TierBadgeProps) {
  const tierConfig = {
    [ClientTier.STANDARD]: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
      label: 'Standard'
    },
    [ClientTier.PREMIUM]: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-300',
      label: 'Premium'
    },
    [ClientTier.ELITE]: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300',
      label: 'Elite'
    }
  }

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  }

  const config = tierConfig[tier]
  const sizeClass = sizeClasses[size]

  return (
    <View className={`rounded-full border ${config.bg} ${config.border} ${sizeClass} self-start`}>
      <Text className={`font-medium ${config.text}`}>
        {showLabel ? config.label : tier.charAt(0).toUpperCase()}
      </Text>
    </View>
  )
}
```

3. Create useTierFeatures hook (packages/mobile-app/src/hooks/useTierFeatures.ts):
```typescript
import { useMemo } from 'react'
import { ClientTier } from '@clientsync/shared'
import { useViewer } from '../user/useViewerContext'

interface TierFeatures {
  // Standard features (available to all)
  basicItinerary: boolean
  emailSupport: boolean
  
  // Premium features
  prioritySupport: boolean
  advancedFilters: boolean
  exportItinerary: boolean
  customActivities: boolean
  
  // Elite features
  conciergeService: boolean
  unlimitedChanges: boolean
  vipLounge: boolean
  privateTransfers: boolean
}

export function useTierFeatures(): TierFeatures {
  const { tier } = useViewer()

  return useMemo(() => {
    const isStandard = tier === ClientTier.STANDARD
    const isPremium = tier === ClientTier.PREMIUM
    const isElite = tier === ClientTier.ELITE

    return {
      // Standard features (all tiers)
      basicItinerary: true,
      emailSupport: true,
      
      // Premium features (Premium and Elite)
      prioritySupport: isPremium || isElite,
      advancedFilters: isPremium || isElite,
      exportItinerary: isPremium || isElite,
      customActivities: isPremium || isElite,
      
      // Elite features (Elite only)
      conciergeService: isElite,
      unlimitedChanges: isElite,
      vipLounge: isElite,
      privateTransfers: isElite
    }
  }, [tier])
}

// Usage hook for specific features
export function useHasFeature(feature: keyof TierFeatures): boolean {
  const features = useTierFeatures()
  return features[feature]
}
```

4. Create TierFeatureList component (packages/mobile-app/src/components/TierFeatureList.tsx):
```typescript
import React from 'react'
import { View, Text } from 'react-native'
import { ClientTier } from '@clientsync/shared'
import { Ionicons } from '@expo/vector-icons'

interface Feature {
  name: string
  tiers: ClientTier[]
}

const ALL_FEATURES: Feature[] = [
  { name: 'Basic trip itinerary', tiers: [ClientTier.STANDARD, ClientTier.PREMIUM, ClientTier.ELITE] },
  { name: 'Email support', tiers: [ClientTier.STANDARD, ClientTier.PREMIUM, ClientTier.ELITE] },
  { name: 'Priority support', tiers: [ClientTier.PREMIUM, ClientTier.ELITE] },
  { name: 'Export itinerary', tiers: [ClientTier.PREMIUM, ClientTier.ELITE] },
  { name: 'Custom activities', tiers: [ClientTier.PREMIUM, ClientTier.ELITE] },
  { name: 'Concierge service', tiers: [ClientTier.ELITE] },
  { name: 'Unlimited changes', tiers: [ClientTier.ELITE] },
  { name: 'VIP lounge access', tiers: [ClientTier.ELITE] },
]

interface TierFeatureListProps {
  currentTier?: ClientTier
  highlightTier?: ClientTier
}

export function TierFeatureList({ currentTier, highlightTier }: TierFeatureListProps) {
  return (
    <View>
      {ALL_FEATURES.map((feature, index) => {
        const isAvailable = highlightTier 
          ? feature.tiers.includes(highlightTier)
          : currentTier ? feature.tiers.includes(currentTier) : false

        return (
          <View key={index} className="flex-row items-center py-2">
            <Ionicons 
              name={isAvailable ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={isAvailable ? "#10B981" : "#EF4444"} 
            />
            <Text className={`ml-3 ${isAvailable ? 'text-gray-900' : 'text-gray-400'}`}>
              {feature.name}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
```

## Usage Examples
```typescript
// Restrict content by tier
<TierGate requiredTier={ClientTier.PREMIUM}>
  <PremiumOnlyComponent />
</TierGate>

// Custom fallback
<TierGate 
  requiredTier={ClientTier.ELITE} 
  fallback={<Text>Contact us for Elite access</Text>}
>
  <EliteContent />
</TierGate>

// Show tier badge
<TierBadge tier={client.tier} size="small" />

// Check features
function MyComponent() {
  const features = useTierFeatures()
  
  if (features.exportItinerary) {
    return <ExportButton />
  }
  
  return null
}
```

## Testing
- TierGate properly restricts content
- Upgrade prompts show correct information
- TierBadge displays all tier variants
- Feature flags work correctly
- Components handle null/undefined tier

## Estimated Effort
1.5 hours