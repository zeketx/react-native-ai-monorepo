import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { FlatList, Pressable, View } from 'react-native';
import Text from 'src/ui/Text.tsx';
import colors from 'src/ui/colors.ts';

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
  const renderTripItem = ({ item }: { item: typeof mockTrips[0] }) => (
    <Link href={`/(app)/(tabs)/trips/${item.id}`} asChild>
      <Pressable className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
            {item.title}
          </Text>
          <View className="flex-row items-center">
            <Ionicons
              name={getStatusIcon(item.status)}
              size={16}
              color={getStatusColor(item.status)}
            />
            <Text 
              className="text-sm font-medium ml-1"
              style={{ color: getStatusColor(item.status) }}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center mb-2">
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
            <Pressable className="mr-2 p-2">
              <Ionicons name="add" size={24} color={colors.purple} />
            </Pressable>
          ),
        }}
      />
      
      <View className="flex-1 bg-gray-50 px-4 pt-4">
        <FlatList
          data={mockTrips}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Ionicons name="airplane-outline" size={64} color={colors.black} />
              <Text className="text-lg font-medium text-gray-900 mt-4">
                <fbt desc="No trips message">No trips yet</fbt>
              </Text>
              <Text className="text-gray-600 text-center mt-2">
                <fbt desc="Add trip suggestion">Tap the + button to add your first trip</fbt>
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
}