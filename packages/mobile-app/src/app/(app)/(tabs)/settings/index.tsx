import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { Pressable, ScrollView, View } from 'react-native';
import Text from 'src/ui/Text.tsx';
import colors from 'src/ui/colors.ts';

const SettingsItem = ({ 
  icon, 
  title, 
  description, 
  href, 
  showArrow = true 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  href?: string; 
  showArrow?: boolean; 
}) => {
  const content = (
    <View className="flex-row items-center py-4 px-4 border-b border-gray-100">
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
        <Ionicons name={icon as any} size={20} color={colors.purple} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-600">{description}</Text>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={colors.black} />
      )}
    </View>
  );

  if (href) {
    return (
      <Link href={href as any} asChild>
        <Pressable>{content}</Pressable>
      </Link>
    );
  }

  return <Pressable>{content}</Pressable>;
};

const SettingsSection = ({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode; 
}) => (
  <View className="mb-6">
    <Text className="text-lg font-semibold text-gray-900 mb-3 px-4">
      {title}
    </Text>
    <View className="bg-white rounded-lg mx-4">
      {children}
    </View>
  </View>
);

export default function SettingsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: String(fbs('Settings', 'Settings screen header title')),
        }}
      />
      
      <ScrollView className="flex-1 bg-gray-50">
        <View className="py-4">
          {/* Preferences */}
          <SettingsSection title="Preferences">
            <SettingsItem
              icon="notifications"
              title="Notifications"
              description="Manage your notification preferences"
              href="/(app)/(tabs)/settings/notifications"
            />
            <SettingsItem
              icon="language"
              title="Language"
              description="Choose your preferred language"
            />
            <SettingsItem
              icon="moon"
              title="Dark Mode"
              description="Toggle dark mode appearance"
            />
          </SettingsSection>

          {/* Privacy & Security */}
          <SettingsSection title="Privacy & Security">
            <SettingsItem
              icon="shield-checkmark"
              title="Privacy"
              description="Manage your privacy settings"
              href="/(app)/(tabs)/settings/privacy"
            />
            <SettingsItem
              icon="lock-closed"
              title="Security"
              description="Password and security settings"
            />
            <SettingsItem
              icon="finger-print"
              title="Biometric Authentication"
              description="Use Face ID or Touch ID"
            />
          </SettingsSection>

          {/* Account */}
          <SettingsSection title="Account">
            <SettingsItem
              icon="cloud-download"
              title="Data Export"
              description="Export your travel data"
            />
            <SettingsItem
              icon="sync"
              title="Sync Settings"
              description="Manage data synchronization"
            />
            <SettingsItem
              icon="trash"
              title="Delete Account"
              description="Permanently delete your account"
            />
          </SettingsSection>

          {/* Support */}
          <SettingsSection title="Support">
            <SettingsItem
              icon="help-circle"
              title="Help Center"
              description="Get help and support"
            />
            <SettingsItem
              icon="chatbubble-ellipses"
              title="Contact Support"
              description="Get in touch with our team"
            />
            <SettingsItem
              icon="star"
              title="Rate App"
              description="Rate us on the App Store"
            />
          </SettingsSection>

          {/* About */}
          <SettingsSection title="About">
            <SettingsItem
              icon="information-circle"
              title="About ClientSync"
              description="Learn more about our app"
            />
            <SettingsItem
              icon="document-text"
              title="Terms of Service"
              description="Read our terms and conditions"
            />
            <SettingsItem
              icon="shield"
              title="Privacy Policy"
              description="Read our privacy policy"
            />
          </SettingsSection>

          {/* App Info */}
          <View className="mx-4 mb-4">
            <View className="bg-white rounded-lg p-4">
              <View className="items-center">
                <Text className="text-sm text-gray-600 mb-1">
                  <fbt desc="App version">Version 1.0.0</fbt>
                </Text>
                <Text className="text-xs text-gray-500">
                  <fbt desc="App build">Build 2024.01.01</fbt>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}