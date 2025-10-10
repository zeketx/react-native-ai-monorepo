import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import colors from 'src/ui/colors.ts';
import Text from 'src/ui/Text.tsx';

// Mock data for trip details
const mockTripDetails = {
  '1': {
    activities: [
      'Client meeting at Tokyo HQ',
      'Product demonstration',
      'Team dinner at Ginza',
      'Sightseeing at Senso-ji Temple',
    ],
    description:
      'Important business meetings with key clients and potential partners.',
    destination: 'Tokyo, Japan',
    endDate: '2024-07-20',
    flight: 'AA 123 - Departure: 2024-07-15 10:00 AM',
    hotel: 'Hotel Okura Tokyo',
    id: '1',
    startDate: '2024-07-15',
    status: 'upcoming',
    title: 'Business Trip to Tokyo',
  },
  '2': {
    activities: [
      'QBR presentation',
      'Contract renewal discussion',
      'Broadway show',
      'Central Park visit',
    ],
    description: 'Quarterly business review with major client.',
    destination: 'New York, USA',
    endDate: '2024-06-05',
    flight: 'UA 456 - Departure: 2024-06-01 8:00 AM',
    hotel: 'The Plaza Hotel',
    id: '2',
    startDate: '2024-06-01',
    status: 'completed',
    title: 'Client Meeting in New York',
  },
  '3': {
    activities: [
      'Opening keynote',
      'Panel discussion',
      'Networking events',
      'Tower Bridge visit',
    ],
    description: 'Annual tech conference with industry leaders.',
    destination: 'London, UK',
    endDate: '2024-08-15',
    flight: 'BA 789 - Departure: 2024-08-10 2:00 PM',
    hotel: 'The Savoy London',
    id: '3',
    startDate: '2024-08-10',
    status: 'planning',
    title: 'Conference in London',
  },
};

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

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = mockTripDetails[id as keyof typeof mockTripDetails];

  if (!trip) {
    return (
      <View className="bg-gray-50 flex-1 items-center justify-center">
        <Ionicons color={colors.black} name="alert-circle" size={64} />
        <Text className="text-gray-900 mt-4 text-lg font-medium">
          <fbt desc="Trip not found">Trip not found</fbt>
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable className="mr-2 p-2">
              <Ionicons
                color={colors.purple}
                name="ellipsis-horizontal"
                size={24}
              />
            </Pressable>
          ),
          title: trip.title,
        }}
      />

      <ScrollView className="bg-gray-50 flex-1">
        <View className="p-4">
          {/* Status and Basic Info */}
          <View className="mb-4 rounded-lg bg-white p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-gray-900 text-xl font-bold">
                {trip.title}
              </Text>
              <View className="flex-row items-center">
                <Ionicons
                  color={getStatusColor(trip.status)}
                  name={getStatusIcon(trip.status)}
                  size={20}
                />
                <Text
                  className="ml-2 text-sm font-medium"
                  style={{ color: getStatusColor(trip.status) }}
                >
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </Text>
              </View>
            </View>

            <View className="mb-2 flex-row items-center">
              <Ionicons color={colors.black} name="location" size={18} />
              <Text className="text-gray-700 ml-2 text-base">
                {trip.destination}
              </Text>
            </View>

            <View className="mb-3 flex-row items-center">
              <Ionicons
                color={colors.black}
                name="calendar-outline"
                size={18}
              />
              <Text className="text-gray-700 ml-2 text-base">
                {trip.startDate} - {trip.endDate}
              </Text>
            </View>

            <Text className="text-gray-600">{trip.description}</Text>
          </View>

          {/* Flight Info */}
          <View className="mb-4 rounded-lg bg-white p-4">
            <View className="mb-3 flex-row items-center">
              <Ionicons color={colors.purple} name="airplane" size={20} />
              <Text className="text-gray-900 ml-2 text-lg font-semibold">
                <fbt desc="Flight info">Flight</fbt>
              </Text>
            </View>
            <Text className="text-gray-700">{trip.flight}</Text>
          </View>

          {/* Hotel Info */}
          <View className="mb-4 rounded-lg bg-white p-4">
            <View className="mb-3 flex-row items-center">
              <Ionicons color={colors.purple} name="bed" size={20} />
              <Text className="text-gray-900 ml-2 text-lg font-semibold">
                <fbt desc="Hotel info">Hotel</fbt>
              </Text>
            </View>
            <Text className="text-gray-700">{trip.hotel}</Text>
          </View>

          {/* Activities */}
          <View className="mb-4 rounded-lg bg-white p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons color={colors.purple} name="list" size={20} />
                <Text className="text-gray-900 ml-2 text-lg font-semibold">
                  <fbt desc="Activities">Activities</fbt>
                </Text>
              </View>
              <Link asChild href={`/(app)/(tabs)/trips/${id}/itinerary`}>
                <Pressable>
                  <Text className="text-purple-600 font-medium">
                    <fbt desc="View itinerary">View Itinerary</fbt>
                  </Text>
                </Pressable>
              </Link>
            </View>

            {trip.activities.map((activity, index) => (
              <View className="mb-2 flex-row items-center" key={index}>
                <Ionicons
                  color={colors.black}
                  name="checkmark-circle-outline"
                  size={16}
                />
                <Text className="text-gray-700 ml-2">{activity}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
