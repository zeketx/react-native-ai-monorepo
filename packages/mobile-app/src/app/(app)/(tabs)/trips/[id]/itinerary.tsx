import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { fbs } from 'fbtee';
import { ScrollView, View } from 'react-native';
import colors from 'src/ui/colors.ts';
import Text from 'src/ui/Text.tsx';

// Mock itinerary data
const mockItineraries = {
  '1': {
    days: [
      {
        activities: [
          {
            location: 'JFK Airport',
            time: '10:00 AM',
            title: 'Flight Departure',
            type: 'travel',
          },
          {
            location: 'Haneda Airport',
            time: '2:00 PM',
            title: 'Arrival in Tokyo',
            type: 'travel',
          },
          {
            location: 'Hotel Okura Tokyo',
            time: '4:00 PM',
            title: 'Hotel Check-in',
            type: 'accommodation',
          },
          {
            location: 'Ginza District',
            time: '7:00 PM',
            title: 'Welcome Dinner',
            type: 'dining',
          },
        ],
        date: '2024-07-15',
        dayName: 'Monday',
      },
      {
        activities: [
          {
            location: 'Tokyo HQ',
            time: '9:00 AM',
            title: 'Client Meeting',
            type: 'business',
          },
          {
            location: 'Sushi Jiro',
            time: '12:00 PM',
            title: 'Lunch Meeting',
            type: 'dining',
          },
          {
            location: 'Tokyo HQ',
            time: '2:00 PM',
            title: 'Product Demo',
            type: 'business',
          },
          {
            location: 'Roppongi',
            time: '6:00 PM',
            title: 'Team Dinner',
            type: 'dining',
          },
        ],
        date: '2024-07-16',
        dayName: 'Tuesday',
      },
      {
        activities: [
          {
            location: 'Tokyo HQ',
            time: '10:00 AM',
            title: 'Contract Discussion',
            type: 'business',
          },
          {
            location: 'Asakusa',
            time: '2:00 PM',
            title: 'Senso-ji Temple Visit',
            type: 'tourism',
          },
          {
            location: 'Shibuya',
            time: '5:00 PM',
            title: 'Shopping',
            type: 'personal',
          },
          {
            location: 'Shibuya Sky',
            time: '8:00 PM',
            title: 'Farewell Dinner',
            type: 'dining',
          },
        ],
        date: '2024-07-17',
        dayName: 'Wednesday',
      },
    ],
    tripTitle: 'Business Trip to Tokyo',
  },
  '2': {
    days: [
      {
        activities: [
          {
            location: 'LAX Airport',
            time: '8:00 AM',
            title: 'Flight Departure',
            type: 'travel',
          },
          {
            location: 'JFK Airport',
            time: '5:00 PM',
            title: 'Arrival in NYC',
            type: 'travel',
          },
          {
            location: 'The Plaza Hotel',
            time: '7:00 PM',
            title: 'Hotel Check-in',
            type: 'accommodation',
          },
        ],
        date: '2024-06-01',
        dayName: 'Saturday',
      },
      {
        activities: [
          {
            location: 'Central Park',
            time: '10:00 AM',
            title: 'Central Park Walk',
            type: 'tourism',
          },
          {
            location: 'MoMA',
            time: '2:00 PM',
            title: 'Museum Visit',
            type: 'tourism',
          },
          {
            location: 'Times Square',
            time: '8:00 PM',
            title: 'Broadway Show',
            type: 'entertainment',
          },
        ],
        date: '2024-06-02',
        dayName: 'Sunday',
      },
    ],
    tripTitle: 'Client Meeting in New York',
  },
  '3': {
    days: [
      {
        activities: [
          {
            location: 'LAX Airport',
            time: '2:00 PM',
            title: 'Flight Departure',
            type: 'travel',
          },
          {
            location: 'Heathrow Airport',
            time: '8:00 AM+1',
            title: 'Arrival in London',
            type: 'travel',
          },
          {
            location: 'The Savoy London',
            time: '11:00 AM',
            title: 'Hotel Check-in',
            type: 'accommodation',
          },
        ],
        date: '2024-08-10',
        dayName: 'Saturday',
      },
      {
        activities: [
          {
            location: 'ExCeL London',
            time: '9:00 AM',
            title: 'Conference Opening',
            type: 'business',
          },
          {
            location: 'ExCeL London',
            time: '11:00 AM',
            title: 'Keynote Speech',
            type: 'business',
          },
          {
            location: 'ExCeL London',
            time: '2:00 PM',
            title: 'Panel Discussion',
            type: 'business',
          },
          {
            location: 'Canary Wharf',
            time: '7:00 PM',
            title: 'Networking Dinner',
            type: 'dining',
          },
        ],
        date: '2024-08-11',
        dayName: 'Sunday',
      },
    ],
    tripTitle: 'Conference in London',
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
        <Ionicons color={colors.black} name="alert-circle" size={64} />
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
            <View className="mb-6" key={dayIndex}>
              <View className="rounded-lg bg-white p-4">
                <View className="mb-4 flex-row items-center">
                  <Ionicons color={colors.purple} name="calendar" size={20} />
                  <Text className="text-gray-900 ml-2 text-lg font-semibold">
                    {day.dayName}, {day.date}
                  </Text>
                </View>

                {day.activities.map((activity, activityIndex) => (
                  <View
                    className="mb-4 flex-row items-start last:mb-0"
                    key={activityIndex}
                  >
                    <View className="mr-3 mt-1">
                      <Ionicons
                        color={getActivityColor(activity.type)}
                        name={getActivityIcon(activity.type)}
                        size={18}
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
                          color={colors.black}
                          name="location-outline"
                          size={14}
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
