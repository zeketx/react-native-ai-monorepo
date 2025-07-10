import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import Text from 'src/ui/Text.tsx';
import colors from 'src/ui/colors.ts';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: string;
}

const NotificationItem = ({ 
  item, 
  onToggle 
}: { 
  item: NotificationSetting; 
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

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'trip-reminders',
      title: 'Trip Reminders',
      description: 'Get notified about upcoming trips',
      enabled: true,
      icon: 'airplane'
    },
    {
      id: 'booking-confirmations',
      title: 'Booking Confirmations',
      description: 'Receive booking confirmation notifications',
      enabled: true,
      icon: 'checkmark-circle'
    },
    {
      id: 'flight-updates',
      title: 'Flight Updates',
      description: 'Get notified about flight changes',
      enabled: true,
      icon: 'time'
    },
    {
      id: 'weather-alerts',
      title: 'Weather Alerts',
      description: 'Weather updates for your destinations',
      enabled: false,
      icon: 'partly-sunny'
    },
    {
      id: 'document-expiry',
      title: 'Document Expiry',
      description: 'Reminders for passport and visa expiry',
      enabled: true,
      icon: 'document-text'
    },
    {
      id: 'expense-reminders',
      title: 'Expense Reminders',
      description: 'Reminders to submit travel expenses',
      enabled: false,
      icon: 'receipt'
    },
    {
      id: 'itinerary-updates',
      title: 'Itinerary Updates',
      description: 'Changes to your travel itinerary',
      enabled: true,
      icon: 'list'
    },
    {
      id: 'marketing',
      title: 'Marketing & Promotions',
      description: 'Special offers and travel deals',
      enabled: false,
      icon: 'megaphone'
    }
  ]);

  const handleToggle = (id: string) => {
    setNotifications(prev => 
      prev.map(item => 
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const enabledCount = notifications.filter(n => n.enabled).length;

  return (
    <>
      <Stack.Screen
        options={{
          title: String(fbs('Notifications', 'Notifications screen header title')),
        }}
      />
      
      <ScrollView className="flex-1 bg-gray-50">
        <View className="py-4">
          {/* Summary Card */}
          <View className="mx-4 mb-6">
            <View className="bg-white rounded-lg p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    <fbt desc="Notification settings">Notification Settings</fbt>
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    <fbt desc="Enabled notifications count">
                      {enabledCount} of {notifications.length} enabled
                    </fbt>
                  </Text>
                </View>
                <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center">
                  <Ionicons name="notifications" size={24} color={colors.purple} />
                </View>
              </View>
            </View>
          </View>

          {/* Travel Notifications */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 px-4">
              <fbt desc="Travel notifications">Travel Notifications</fbt>
            </Text>
            <View className="bg-white rounded-lg mx-4">
              {notifications.filter(n => 
                ['trip-reminders', 'booking-confirmations', 'flight-updates', 'weather-alerts', 'document-expiry', 'itinerary-updates'].includes(n.id)
              ).map((item, index, array) => (
                <View key={item.id} className={index === array.length - 1 ? '' : 'border-b border-gray-100'}>
                  <NotificationItem item={item} onToggle={handleToggle} />
                </View>
              ))}
            </View>
          </View>

          {/* Expense Notifications */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 px-4">
              <fbt desc="Expense notifications">Expense Notifications</fbt>
            </Text>
            <View className="bg-white rounded-lg mx-4">
              {notifications.filter(n => n.id === 'expense-reminders').map((item) => (
                <NotificationItem key={item.id} item={item} onToggle={handleToggle} />
              ))}
            </View>
          </View>

          {/* Marketing */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 px-4">
              <fbt desc="Marketing notifications">Marketing</fbt>
            </Text>
            <View className="bg-white rounded-lg mx-4">
              {notifications.filter(n => n.id === 'marketing').map((item) => (
                <NotificationItem key={item.id} item={item} onToggle={handleToggle} />
              ))}
            </View>
          </View>

          {/* Notification Settings Info */}
          <View className="mx-4 mb-4">
            <View className="bg-blue-50 rounded-lg p-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#2563eb" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm text-blue-800">
                    <fbt desc="Notification settings info">
                      You can also manage notification settings from your device's Settings app.
                    </fbt>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}