import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { fbs } from 'fbtee';
import { Pressable, ScrollView, View } from 'react-native';
import Text from 'src/ui/Text.tsx';
import colors from 'src/ui/colors.ts';

// Mock data for trip details
const mockTripDetails = {
  '1': {
    id: '1',
    title: 'Business Trip to Tokyo',
    destination: 'Tokyo, Japan',
    startDate: '2024-07-15',
    endDate: '2024-07-20',
    status: 'upcoming',
    description: 'Important business meetings with key clients and potential partners.',
    hotel: 'Hotel Okura Tokyo',
    flight: 'AA 123 - Departure: 2024-07-15 10:00 AM',
    activities: [
      'Client meeting at Tokyo HQ',
      'Product demonstration',
      'Team dinner at Ginza',
      'Sightseeing at Senso-ji Temple'
    ]
  },
  '2': {
    id: '2',
    title: 'Client Meeting in New York',
    destination: 'New York, USA',
    startDate: '2024-06-01',
    endDate: '2024-06-05',
    status: 'completed',
    description: 'Quarterly business review with major client.',
    hotel: 'The Plaza Hotel',
    flight: 'UA 456 - Departure: 2024-06-01 8:00 AM',
    activities: [
      'QBR presentation',
      'Contract renewal discussion',
      'Broadway show',
      'Central Park visit'
    ]
  },
  '3': {
    id: '3',
    title: 'Conference in London',
    destination: 'London, UK',
    startDate: '2024-08-10',
    endDate: '2024-08-15',
    status: 'planning',
    description: 'Annual tech conference with industry leaders.',
    hotel: 'The Savoy London',
    flight: 'BA 789 - Departure: 2024-08-10 2:00 PM',
    activities: [
      'Opening keynote',
      'Panel discussion',
      'Networking events',
      'Tower Bridge visit'
    ]
  }
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
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Ionicons name="alert-circle" size={64} color={colors.black} />
        <Text className="text-lg font-medium text-gray-900 mt-4">
          <fbt desc="Trip not found">Trip not found</fbt>
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: trip.title,
          headerRight: () => (
            <Pressable className="mr-2 p-2">
              <Ionicons name="ellipsis-horizontal" size={24} color={colors.purple} />
            </Pressable>
          ),
        }}
      />
      
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4">
          {/* Status and Basic Info */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xl font-bold text-gray-900">
                {trip.title}
              </Text>
              <View className="flex-row items-center">
                <Ionicons
                  name={getStatusIcon(trip.status)}
                  size={20}
                  color={getStatusColor(trip.status)}
                />
                <Text 
                  className="text-sm font-medium ml-2"
                  style={{ color: getStatusColor(trip.status) }}
                >
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center mb-2">
              <Ionicons name="location" size={18} color={colors.black} />
              <Text className="text-gray-700 ml-2 text-base">{trip.destination}</Text>
            </View>
            
            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar-outline" size={18} color={colors.black} />
              <Text className="text-gray-700 ml-2 text-base">
                {trip.startDate} - {trip.endDate}
              </Text>
            </View>
            
            <Text className="text-gray-600">{trip.description}</Text>
          </View>

          {/* Flight Info */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="airplane" size={20} color={colors.purple} />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                <fbt desc="Flight info">Flight</fbt>
              </Text>
            </View>
            <Text className="text-gray-700">{trip.flight}</Text>
          </View>

          {/* Hotel Info */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="bed" size={20} color={colors.purple} />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                <fbt desc="Hotel info">Hotel</fbt>
              </Text>
            </View>
            <Text className="text-gray-700">{trip.hotel}</Text>
          </View>

          {/* Activities */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="list" size={20} color={colors.purple} />
                <Text className="text-lg font-semibold text-gray-900 ml-2">
                  <fbt desc="Activities">Activities</fbt>
                </Text>
              </View>
              <Link href={`/(app)/(tabs)/trips/${id}/itinerary`} asChild>
                <Pressable>
                  <Text className="text-purple-600 font-medium">
                    <fbt desc="View itinerary">View Itinerary</fbt>
                  </Text>
                </Pressable>
              </Link>
            </View>
            
            {trip.activities.map((activity, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.black} />
                <Text className="text-gray-700 ml-2">{activity}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}