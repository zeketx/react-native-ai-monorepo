import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { FlatList, Pressable, View } from 'react-native';
import colors from 'src/ui/colors.ts';
import Text from 'src/ui/Text.tsx';

// Mock data for trips
const mockTrips = [
  {
    destination: 'Tokyo, Japan',
    endDate: '2024-07-20',
    id: '1',
    startDate: '2024-07-15',
    status: 'upcoming',
    title: 'Business Trip to Tokyo',
  },
  {
    destination: 'New York, USA',
    endDate: '2024-06-05',
    id: '2',
    startDate: '2024-06-01',
    status: 'completed',
    title: 'Client Meeting in New York',
  },
  {
    destination: 'London, UK',
    endDate: '2024-08-15',
    id: '3',
    startDate: '2024-08-10',
    status: 'planning',
    title: 'Conference in London',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'upcoming':
      return '#16a34a'; // green
    case 'completed':
      return '#6b7280'; // gray
    case 'planning':
      return '#2563eb'; // blue
    default:
      return colors.black;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'upcoming':
      return 'calendar';
    case 'completed':
      return 'checkmark-circle';
    case 'planning':
      return 'construct';
    default:
      return 'help-circle';
  }
};

export default function TripsScreen() {
  const renderTripItem = ({ item }: { item: (typeof mockTrips)[0] }) => (
    <Link asChild href={`/(app)/(tabs)/trips/${item.id}`}>
      <Pressable className="border-gray-200 mb-3 rounded-lg border bg-white p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text
            className="text-gray-900 text-lg font-semibold"
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <View className="flex-row items-center">
            <Ionicons
              color={getStatusColor(item.status)}
              name={getStatusIcon(item.status)}
              size={16}
            />
            <Text
              className="ml-1 text-sm font-medium"
              style={{ color: getStatusColor(item.status) }}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View className="mb-2 flex-row items-center">
          <Ionicons color={colors.black} name="location" size={16} />
          <Text className="text-gray-600 ml-2">{item.destination}</Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons color={colors.black} name="calendar-outline" size={16} />
          <Text className="text-gray-600 ml-2">
            {item.startDate} - {item.endDate}
          </Text>
        </View>
      </Pressable>
    </Link>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link asChild href="/(app)/add-trip">
              <Pressable className="mr-2 p-2">
                <Ionicons color={colors.purple} name="add" size={24} />
              </Pressable>
            </Link>
          ),
          title: String(fbs('Trips', 'Trips screen header title')),
        }}
      />

      <View className="bg-gray-50 flex-1 px-4 pt-4">
        <FlatList
          data={mockTrips}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Ionicons
                color={colors.black}
                name="airplane-outline"
                size={64}
              />
              <Text className="text-gray-900 mt-4 text-lg font-medium">
                <fbt desc="No trips message">No trips yet</fbt>
              </Text>
              <Text className="text-gray-600 mt-2 text-center">
                <fbt desc="Add trip suggestion">
                  Tap the + button to add your first trip
                </fbt>
              </Text>
            </View>
          }
          renderItem={renderTripItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}
