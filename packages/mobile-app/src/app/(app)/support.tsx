import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import Button from 'src/ui/Button.tsx';
import colors from 'src/ui/colors.ts';
import Text from 'src/ui/Text.tsx';

const supportOptions = [
  {
    icon: 'mail',
    title: 'Email Support',
    description: 'Get help via email',
    action: () => Linking.openURL('mailto:support@clientsync.com'),
  },
  {
    icon: 'chatbubble',
    title: 'Live Chat',
    description: 'Chat with our support team',
    action: () => console.log('Open live chat'),
  },
  {
    icon: 'call',
    title: 'Phone Support',
    description: 'Call our support line',
    action: () => Linking.openURL('tel:+1-800-SUPPORT'),
  },
  {
    icon: 'help-circle',
    title: 'FAQ',
    description: 'Find answers to common questions',
    action: () => console.log('Open FAQ'),
  },
];

export default function SupportModal() {
  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: String(fbs('Support', 'Support modal title')),
          headerLeft: () => (
            <Pressable onPress={handleClose} className="p-2">
              <Ionicons name="close" size={24} color={colors.black} />
            </Pressable>
          ),
          presentation: 'modal',
        }}
      />

      <ScrollView className="bg-gray-50 flex-1">
        <View className="p-4">
          <View className="mb-4 rounded-lg bg-white p-4">
            <Text className="text-gray-900 mb-2 text-lg font-semibold">
              <fbs desc="How can we help">How can we help you?</fbs>
            </Text>
            <Text className="text-gray-600 mb-4">
              <fbs desc="Support description">
                Choose the best way to get in touch with our support team.
              </fbs>
            </Text>

            {supportOptions.map((option, index) => (
              <Pressable
                key={index}
                onPress={option.action}
                className="border-gray-200 mb-3 flex-row items-center rounded-lg border p-3"
              >
                <View className="bg-purple-100 mr-3 h-10 w-10 items-center justify-center rounded-full">
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={colors.purple}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">
                    {option.title}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {option.description}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.black}
                />
              </Pressable>
            ))}
          </View>

          <View className="mb-4 rounded-lg bg-white p-4">
            <Text className="text-gray-900 mb-2 text-lg font-semibold">
              <fbs desc="Send feedback">Send Feedback</fbs>
            </Text>
            <Text className="text-gray-600 mb-4">
              <fbs desc="Feedback description">
                Help us improve the app by sharing your feedback.
              </fbs>
            </Text>

            <Button
              onPress={() => Linking.openURL('mailto:feedback@clientsync.com')}
            >
              <fbs desc="Send feedback">Send Feedback</fbs>
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
