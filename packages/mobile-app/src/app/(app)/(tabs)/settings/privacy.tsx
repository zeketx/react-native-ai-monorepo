import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';
import Button from 'src/ui/Button.tsx';
import Text from 'src/ui/Text.tsx';
import colors from 'src/ui/colors.ts';

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: string;
}

const PrivacyItem = ({ 
  item, 
  onToggle 
}: { 
  item: PrivacySetting; 
  onToggle: (id: string) => void; 
}) => (
  <View className="flex-row items-center py-4 px-4 border-b border-gray-100">
    <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
      <Ionicons name={item.icon as any} size={20} color={colors.purple} />
    </View>
    <View className="flex-1">
      <Text className="text-base font-medium text-gray-900">{item.title}</Text>
      <Text className="text-sm text-gray-600">{item.description}</Text>
    </View>
    <Switch
      value={item.enabled}
      onValueChange={() => onToggle(item.id)}
      trackColor={{ false: '#f3f4f6', true: colors.purple }}
      thumbColor={item.enabled ? '#ffffff' : '#ffffff'}
    />
  </View>
);

const ActionItem = ({ 
  icon, 
  title, 
  description, 
  onPress,
  variant = 'default'
}: { 
  icon: string; 
  title: string; 
  description: string; 
  onPress: () => void;
  variant?: 'default' | 'danger';
}) => (
  <Pressable 
    className="flex-row items-center py-4 px-4 border-b border-gray-100"
    onPress={onPress}
  >
    <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={variant === 'danger' ? '#dc2626' : colors.purple} 
      />
    </View>
    <View className="flex-1">
      <Text className={`text-base font-medium ${variant === 'danger' ? 'text-red-600' : 'text-gray-900'}`}>
        {title}
      </Text>
      <Text className="text-sm text-gray-600">{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.black} />
  </Pressable>
);

export default function PrivacyScreen() {
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>([
    {
      id: 'location-sharing',
      title: 'Location Sharing',
      description: 'Share your location with emergency contacts',
      enabled: true,
      icon: 'location'
    },
    {
      id: 'travel-history',
      title: 'Travel History',
      description: 'Allow access to your travel history',
      enabled: true,
      icon: 'time'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Help improve the app with usage analytics',
      enabled: false,
      icon: 'analytics'
    },
    {
      id: 'crash-reports',
      title: 'Crash Reports',
      description: 'Automatically send crash reports',
      enabled: true,
      icon: 'bug'
    }
  ]);

  const handleToggle = (id: string) => {
    setPrivacySettings(prev => 
      prev.map(item => 
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Download Data',
      'Your data will be prepared and sent to your email address. This may take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => {} }
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Are you absolutely sure? This will delete all your trips, preferences, and account data.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete Forever', style: 'destructive', onPress: () => {} }
              ]
            );
          }
        }
      ]
    );
  };

  const handleRequestDeletion = () => {
    Alert.alert(
      'Request Account Deletion',
      'We will process your account deletion request within 30 days. You will receive a confirmation email.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request', onPress: () => {} }
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: String(fbs('Privacy', 'Privacy screen header title')),
        }}
      />
      
      <ScrollView className="flex-1 bg-gray-50">
        <View className="py-4">
          {/* Privacy Overview */}
          <View className="mx-4 mb-6">
            <View className="bg-white rounded-lg p-4">
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mr-4">
                  <Ionicons name="shield-checkmark" size={24} color={colors.purple} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    <fbt desc="Privacy settings">Privacy Settings</fbt>
                  </Text>
                  <Text className="text-sm text-gray-600">
                    <fbt desc="Privacy description">Control how your data is used</fbt>
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Data Sharing */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 px-4">
              <fbt desc="Data sharing">Data Sharing</fbt>
            </Text>
            <View className="bg-white rounded-lg mx-4">
              {privacySettings.map((item, index, array) => (
                <View key={item.id} className={index === array.length - 1 ? '' : 'border-b border-gray-100'}>
                  <PrivacyItem item={item} onToggle={handleToggle} />
                </View>
              ))}
            </View>
          </View>

          {/* Data Management */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 px-4">
              <fbt desc="Data management">Data Management</fbt>
            </Text>
            <View className="bg-white rounded-lg mx-4">
              <ActionItem
                icon="download"
                title="Download My Data"
                description="Get a copy of all your data"
                onPress={handleDownloadData}
              />
              <ActionItem
                icon="trash"
                title="Delete All Data"
                description="Permanently delete all your data"
                onPress={handleDeleteData}
                variant="danger"
              />
            </View>
          </View>

          {/* Account Deletion */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 px-4">
              <fbt desc="Account deletion">Account Deletion</fbt>
            </Text>
            <View className="bg-white rounded-lg mx-4">
              <ActionItem
                icon="person-remove"
                title="Request Account Deletion"
                description="Permanently delete your account"
                onPress={handleRequestDeletion}
                variant="danger"
              />
            </View>
          </View>

          {/* Privacy Notice */}
          <View className="mx-4 mb-4">
            <View className="bg-blue-50 rounded-lg p-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#2563eb" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm text-blue-800 mb-2">
                    <fbt desc="Privacy notice title">Your Privacy Matters</fbt>
                  </Text>
                  <Text className="text-sm text-blue-700">
                    <fbt desc="Privacy notice description">
                      We are committed to protecting your privacy. Review our Privacy Policy to understand how we collect, use, and protect your information.
                    </fbt>
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mx-4 mb-6">
            <View className="flex-row space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => {}}
              >
                <fbt desc="Privacy policy">Privacy Policy</fbt>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => {}}
              >
                <fbt desc="Terms of service">Terms of Service</fbt>
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}