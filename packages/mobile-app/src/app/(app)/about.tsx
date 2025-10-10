import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import colors from 'src/ui/colors.ts';
import Text from 'src/ui/Text.tsx';

const aboutItems = [
  {
    icon: 'information-circle',
    title: 'Version',
    value: '1.0.0',
  },
  {
    icon: 'build',
    title: 'Build Number',
    value: '1',
  },
  {
    icon: 'person',
    title: 'Developer',
    value: 'ClientSync Team',
  },
  {
    action: () => Linking.openURL('https://clientsync.com'),
    icon: 'globe',
    title: 'Website',
    value: 'clientsync.com',
  },
  {
    action: () => Linking.openURL('https://clientsync.com/privacy'),
    icon: 'document-text',
    title: 'Privacy Policy',
    value: 'View Privacy Policy',
  },
  {
    action: () => Linking.openURL('https://clientsync.com/terms'),
    icon: 'shield-checkmark',
    title: 'Terms of Service',
    value: 'View Terms of Service',
  },
];

export default function AboutModal() {
  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable className="p-2" onPress={handleClose}>
              <Ionicons color={colors.black} name="close" size={24} />
            </Pressable>
          ),
          presentation: 'modal',
          title: String(fbs('About', 'About modal title')),
        }}
      />

      <ScrollView className="bg-gray-50 flex-1">
        <View className="p-4">
          {/* App Info */}
          <View className="mb-4 items-center rounded-lg bg-white p-4">
            <View className="bg-purple-100 mb-4 h-20 w-20 items-center justify-center rounded-full">
              <Ionicons color={colors.purple} name="airplane" size={40} />
            </View>

            <Text className="text-gray-900 mb-2 text-2xl font-bold">
              ClientSync
            </Text>

            <Text className="text-gray-600 mb-4 text-center">
              <fbs desc="App description">
                Your all-in-one travel companion for business trips and personal
                journeys.
              </fbs>
            </Text>
          </View>

          {/* App Details */}
          <View className="mb-4 rounded-lg bg-white p-4">
            <Text className="text-gray-900 mb-4 text-lg font-semibold">
              <fbs desc="App details">App Details</fbs>
            </Text>

            {aboutItems.map((item, index) => (
              <Pressable
                className="border-gray-100 flex-row items-center border-b py-3 last:border-b-0"
                disabled={!item.action}
                key={index}
                onPress={item.action}
              >
                <View className="bg-gray-100 mr-3 h-8 w-8 items-center justify-center rounded-full">
                  <Ionicons
                    color={colors.black}
                    name={item.icon as any}
                    size={16}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">
                    {item.title}
                  </Text>
                  <Text className="text-gray-600 text-sm">{item.value}</Text>
                </View>
                {item.action && (
                  <Ionicons
                    color={colors.black}
                    name="chevron-forward"
                    size={16}
                  />
                )}
              </Pressable>
            ))}
          </View>

          {/* Copyright */}
          <View className="mb-4 rounded-lg bg-white p-4">
            <Text className="text-gray-600 text-center text-sm">
              <fbs desc="Copyright">
                © 2024 ClientSync. All rights reserved.
              </fbs>
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
