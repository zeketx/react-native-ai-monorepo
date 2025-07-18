import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { FlatList, Pressable, View } from 'react-native';
import colors from 'src/ui/colors.ts';
import Text from 'src/ui/Text.tsx';

// Mock data for trips
const mockTrips = [
  {
    id: '1',
    title: 'Business Trip to Tokyo',
    destination: 'Tokyo, Japan',
    startDate: '2024-07-15',
    endDate: '2024-07-20',
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Client Meeting in New York',
    destination: 'New York, USA',
    startDate: '2024-06-01',
    endDate: '2024-06-05',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Conference in London',
    destination: 'London, UK',
    startDate: '2024-08-10',
    endDate: '2024-08-15',
    status: 'planning',
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
    <Link href={`/(app)/(tabs)/trips/${item.id}`} asChild>
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
              name={getStatusIcon(item.status)}
              size={16}
              color={getStatusColor(item.status)}
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
          <Ionicons name="location" size={16} color={colors.black} />
          <Text className="text-gray-600 ml-2">{item.destination}</Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color={colors.black} />
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
          title: String(fbs('Trips', 'Trips screen header title')),
          headerRight: () => (
            <Link href="/(app)/add-trip" asChild>
              <Pressable className="mr-2 p-2">
                <Ionicons name="add" size={24} color={colors.purple} />
              </Pressable>
            </Link>
          ),
        }}
      />

      <View className="bg-gray-50 flex-1 px-4 pt-4">
        <FlatList
          data={mockTrips}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Ionicons
                name="airplane-outline"
                size={64}
                color={colors.black}
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
        />
      </View>
    </>
  );
}
