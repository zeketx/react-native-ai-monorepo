import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { Pressable, ScrollView, View } from 'react-native';
import colors from 'src/ui/colors.ts';
import Text from 'src/ui/Text.tsx';

const SettingsItem = ({
  icon,
  title,
  description,
  href,
  showArrow = true,
}: {
  icon: string;
  title: string;
  description: string;
  href?: string;
  showArrow?: boolean;
}) => {
  const content = (
    <View className="border-gray-100 flex-row items-center border-b px-4 py-4">
      <View className="bg-gray-100 mr-4 h-10 w-10 items-center justify-center rounded-full">
        <Ionicons name={icon as any} size={20} color={colors.purple} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 text-base font-medium">{title}</Text>
        <Text className="text-gray-600 text-sm">{description}</Text>
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View className="mb-6">
    <Text className="text-gray-900 mb-3 px-4 text-lg font-semibold">
      {title}
    </Text>
    <View className="mx-4 rounded-lg bg-white">{children}</View>
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

      <ScrollView className="bg-gray-50 flex-1">
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
              href="/(app)/support"
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
              href="/(app)/about"
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
            <View className="rounded-lg bg-white p-4">
              <View className="items-center">
                <Text className="text-gray-600 mb-1 text-sm">
                  <fbt desc="App version">Version 1.0.0</fbt>
                </Text>
                <Text className="text-gray-500 text-xs">
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
