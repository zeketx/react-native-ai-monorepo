import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { Pressable, ScrollView, View } from 'react-native';
import colors from 'src/ui/colors.ts';
import Text from 'src/ui/Text.tsx';

const SettingsItem = ({
  description,
  href,
  icon,
  showArrow = true,
  title,
}: {
  description: string;
  href?: string;
  icon: string;
  showArrow?: boolean;
  title: string;
}) => {
  const content = (
    <View className="border-gray-100 flex-row items-center border-b px-4 py-4">
      <View className="bg-gray-100 mr-4 h-10 w-10 items-center justify-center rounded-full">
        <Ionicons color={colors.purple} name={icon as any} size={20} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 text-base font-medium">{title}</Text>
        <Text className="text-gray-600 text-sm">{description}</Text>
      </View>
      {showArrow && (
        <Ionicons color={colors.black} name="chevron-forward" size={20} />
      )}
    </View>
  );

  if (href) {
    return (
      <Link asChild href={href as any}>
        <Pressable>{content}</Pressable>
      </Link>
    );
  }

  return <Pressable>{content}</Pressable>;
};

const SettingsSection = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
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
              description="Manage your notification preferences"
              href="/(app)/(tabs)/settings/notifications"
              icon="notifications"
              title="Notifications"
            />
            <SettingsItem
              description="Choose your preferred language"
              icon="language"
              title="Language"
            />
            <SettingsItem
              description="Toggle dark mode appearance"
              icon="moon"
              title="Dark Mode"
            />
          </SettingsSection>

          {/* Privacy & Security */}
          <SettingsSection title="Privacy & Security">
            <SettingsItem
              description="Manage your privacy settings"
              href="/(app)/(tabs)/settings/privacy"
              icon="shield-checkmark"
              title="Privacy"
            />
            <SettingsItem
              description="Password and security settings"
              icon="lock-closed"
              title="Security"
            />
            <SettingsItem
              description="Use Face ID or Touch ID"
              icon="finger-print"
              title="Biometric Authentication"
            />
          </SettingsSection>

          {/* Account */}
          <SettingsSection title="Account">
            <SettingsItem
              description="Export your travel data"
              icon="cloud-download"
              title="Data Export"
            />
            <SettingsItem
              description="Manage data synchronization"
              icon="sync"
              title="Sync Settings"
            />
            <SettingsItem
              description="Permanently delete your account"
              icon="trash"
              title="Delete Account"
            />
          </SettingsSection>

          {/* Support */}
          <SettingsSection title="Support">
            <SettingsItem
              description="Get help and support"
              icon="help-circle"
              title="Help Center"
            />
            <SettingsItem
              description="Get in touch with our team"
              href="/(app)/support"
              icon="chatbubble-ellipses"
              title="Contact Support"
            />
            <SettingsItem
              description="Rate us on the App Store"
              icon="star"
              title="Rate App"
            />
          </SettingsSection>

          {/* About */}
          <SettingsSection title="About">
            <SettingsItem
              description="Learn more about our app"
              href="/(app)/about"
              icon="information-circle"
              title="About ClientSync"
            />
            <SettingsItem
              description="Read our terms and conditions"
              icon="document-text"
              title="Terms of Service"
            />
            <SettingsItem
              description="Read our privacy policy"
              icon="shield"
              title="Privacy Policy"
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
