import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { fbs } from 'fbtee';
import { ScrollView, View } from 'react-native';
import colors from 'src/ui/colors.ts';
import Text from 'src/ui/Text.tsx';

// Mock itinerary data
const mockItineraries = {
  '1': {
    tripTitle: 'Business Trip to Tokyo',
    days: [
      {
        date: '2024-07-15',
        dayName: 'Monday',
        activities: [
          {
            time: '10:00 AM',
            title: 'Flight Departure',
            location: 'JFK Airport',
            type: 'travel',
          },
          {
            time: '2:00 PM',
            title: 'Arrival in Tokyo',
            location: 'Haneda Airport',
            type: 'travel',
          },
          {
            time: '4:00 PM',
            title: 'Hotel Check-in',
            location: 'Hotel Okura Tokyo',
            type: 'accommodation',
          },
          {
            time: '7:00 PM',
            title: 'Welcome Dinner',
            location: 'Ginza District',
            type: 'dining',
          },
        ],
      },
      {
        date: '2024-07-16',
        dayName: 'Tuesday',
        activities: [
          {
            time: '9:00 AM',
            title: 'Client Meeting',
            location: 'Tokyo HQ',
            type: 'business',
          },
          {
            time: '12:00 PM',
            title: 'Lunch Meeting',
            location: 'Sushi Jiro',
            type: 'dining',
          },
          {
            time: '2:00 PM',
            title: 'Product Demo',
            location: 'Tokyo HQ',
            type: 'business',
          },
          {
            time: '6:00 PM',
            title: 'Team Dinner',
            location: 'Roppongi',
            type: 'dining',
          },
        ],
      },
      {
        date: '2024-07-17',
        dayName: 'Wednesday',
        activities: [
          {
            time: '10:00 AM',
            title: 'Contract Discussion',
            location: 'Tokyo HQ',
            type: 'business',
          },
          {
            time: '2:00 PM',
            title: 'Senso-ji Temple Visit',
            location: 'Asakusa',
            type: 'tourism',
          },
          {
            time: '5:00 PM',
            title: 'Shopping',
            location: 'Shibuya',
            type: 'personal',
          },
          {
            time: '8:00 PM',
            title: 'Farewell Dinner',
            location: 'Shibuya Sky',
            type: 'dining',
          },
        ],
      },
    ],
  },
  '2': {
    tripTitle: 'Client Meeting in New York',
    days: [
      {
        date: '2024-06-01',
        dayName: 'Saturday',
        activities: [
          {
            time: '8:00 AM',
            title: 'Flight Departure',
            location: 'LAX Airport',
            type: 'travel',
          },
          {
            time: '5:00 PM',
            title: 'Arrival in NYC',
            location: 'JFK Airport',
            type: 'travel',
          },
          {
            time: '7:00 PM',
            title: 'Hotel Check-in',
            location: 'The Plaza Hotel',
            type: 'accommodation',
          },
        ],
      },
      {
        date: '2024-06-02',
        dayName: 'Sunday',
        activities: [
          {
            time: '10:00 AM',
            title: 'Central Park Walk',
            location: 'Central Park',
            type: 'tourism',
          },
          {
            time: '2:00 PM',
            title: 'Museum Visit',
            location: 'MoMA',
            type: 'tourism',
          },
          {
            time: '8:00 PM',
            title: 'Broadway Show',
            location: 'Times Square',
            type: 'entertainment',
          },
        ],
      },
    ],
  },
  '3': {
    tripTitle: 'Conference in London',
    days: [
      {
        date: '2024-08-10',
        dayName: 'Saturday',
        activities: [
          {
            time: '2:00 PM',
            title: 'Flight Departure',
            location: 'LAX Airport',
            type: 'travel',
          },
          {
            time: '8:00 AM+1',
            title: 'Arrival in London',
            location: 'Heathrow Airport',
            type: 'travel',
          },
          {
            time: '11:00 AM',
            title: 'Hotel Check-in',
            location: 'The Savoy London',
            type: 'accommodation',
          },
        ],
      },
      {
        date: '2024-08-11',
        dayName: 'Sunday',
        activities: [
          {
            time: '9:00 AM',
            title: 'Conference Opening',
            location: 'ExCeL London',
            type: 'business',
          },
          {
            time: '11:00 AM',
            title: 'Keynote Speech',
            location: 'ExCeL London',
            type: 'business',
          },
          {
            time: '2:00 PM',
            title: 'Panel Discussion',
            location: 'ExCeL London',
            type: 'business',
          },
          {
            time: '7:00 PM',
            title: 'Networking Dinner',
            location: 'Canary Wharf',
            type: 'dining',
          },
        ],
      },
    ],
  },
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'travel':
      return 'airplane';
    case 'accommodation':
      return 'bed';
    case 'business':
      return 'briefcase';
    case 'dining':
      return 'restaurant';
    case 'tourism':
      return 'camera';
    case 'entertainment':
      return 'musical-notes';
    case 'personal':
      return 'person';
    default:
      return 'time';
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'travel':
      return '#2563eb'; // blue
    case 'accommodation':
      return '#16a34a'; // green
    case 'business':
      return '#dc2626'; // red
    case 'dining':
      return '#d97706'; // orange
    case 'tourism':
      return '#7c3aed'; // purple
    case 'entertainment':
      return '#db2777'; // pink
    case 'personal':
      return '#059669'; // emerald
    default:
      return colors.black;
  }
};

export default function ItineraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const itinerary = mockItineraries[id as keyof typeof mockItineraries];

  if (!itinerary) {
    return (
      <View className="bg-gray-50 flex-1 items-center justify-center">
        <Ionicons name="alert-circle" size={64} color={colors.black} />
        <Text className="text-gray-900 mt-4 text-lg font-medium">
          <fbt desc="Itinerary not found">Itinerary not found</fbt>
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: String(fbs('Itinerary', 'Itinerary screen header title')),
        }}
      />

      <ScrollView className="bg-gray-50 flex-1">
        <View className="p-4">
          <Text className="text-gray-900 mb-4 text-xl font-bold">
            {itinerary.tripTitle}
          </Text>

          {itinerary.days.map((day, dayIndex) => (
            <View key={dayIndex} className="mb-6">
              <View className="rounded-lg bg-white p-4">
                <View className="mb-4 flex-row items-center">
                  <Ionicons name="calendar" size={20} color={colors.purple} />
                  <Text className="text-gray-900 ml-2 text-lg font-semibold">
                    {day.dayName}, {day.date}
                  </Text>
                </View>

                {day.activities.map((activity, activityIndex) => (
                  <View
                    key={activityIndex}
                    className="mb-4 flex-row items-start last:mb-0"
                  >
                    <View className="mr-3 mt-1">
                      <Ionicons
                        name={getActivityIcon(activity.type)}
                        size={18}
                        color={getActivityColor(activity.type)}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="mb-1 flex-row items-center justify-between">
                        <Text className="text-gray-900 text-base font-medium">
                          {activity.title}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {activity.time}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color={colors.black}
                        />
                        <Text className="text-gray-600 ml-1 text-sm">
                          {activity.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}
