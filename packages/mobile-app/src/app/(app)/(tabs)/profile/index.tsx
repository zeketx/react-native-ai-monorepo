import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { Image, Pressable, ScrollView, View } from 'react-native';
import colors from 'src/ui/colors.ts';
import Text from 'src/ui/Text.tsx';
import useViewerContext from 'src/user/useViewerContext.tsx';

// Mock user data
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://via.placeholder.com/150',
  title: 'Senior Business Analyst',
  company: 'ClientSync Corp',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  joinDate: '2023-01-15',
  stats: {
    totalTrips: 12,
    upcomingTrips: 3,
    completedTrips: 9,
    countries: 8,
  },
  recentTrips: [
    { id: '1', title: 'Business Trip to Tokyo', date: '2024-07-15' },
    { id: '2', title: 'Client Meeting in New York', date: '2024-06-01' },
    { id: '3', title: 'Conference in London', date: '2024-08-10' },
  ],
};

const ProfileItem = ({
  icon,
  label,
  value,
  onPress,
}: {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
}) => (
  <Pressable
    className="border-gray-100 flex-row items-center border-b px-4 py-3"
    onPress={onPress}
  >
    <Ionicons name={icon as any} size={20} color={colors.black} />
    <View className="ml-3 flex-1">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-gray-900 text-base">{value}</Text>
    </View>
    {onPress && (
      <Ionicons name="chevron-forward" size={20} color={colors.black} />
    )}
  </Pressable>
);

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) => (
  <View className="flex-1 items-center rounded-lg bg-white p-4">
    <Ionicons name={icon as any} size={24} color={colors.purple} />
    <Text className="text-gray-900 mt-2 text-2xl font-bold">{value}</Text>
    <Text className="text-gray-600 text-center text-sm">{title}</Text>
  </View>
);

export default function ProfileScreen() {
  const { isAuthenticated } = useViewerContext();

  return (
    <>
      <Stack.Screen
        options={{
          title: String(fbs('Profile', 'Profile screen header title')),
          headerRight: () => (
            <Link href="/(app)/(tabs)/profile/edit" asChild>
              <Pressable className="mr-2 p-2">
                <Ionicons
                  name="create-outline"
                  size={24}
                  color={colors.purple}
                />
              </Pressable>
            </Link>
          ),
        }}
      />

      <ScrollView className="bg-gray-50 flex-1">
        {/* Profile Header */}
        <View className="bg-white px-4 py-6">
          <View className="items-center">
            <View className="bg-gray-200 h-24 w-24 items-center justify-center rounded-full">
              <Ionicons name="person" size={48} color={colors.black} />
            </View>
            <Text className="text-gray-900 mt-3 text-xl font-bold">
              {mockUser.name}
            </Text>
            <Text className="text-gray-600">{mockUser.title}</Text>
            <Text className="text-gray-600">{mockUser.company}</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="px-4 py-4">
          <Text className="text-gray-900 mb-3 text-lg font-semibold">
            <fbt desc="Travel stats">Travel Statistics</fbt>
          </Text>
          <View className="flex-row space-x-3">
            <StatCard
              title="Total Trips"
              value={mockUser.stats.totalTrips}
              icon="airplane"
            />
            <StatCard
              title="Countries"
              value={mockUser.stats.countries}
              icon="globe"
            />
          </View>
          <View className="mt-3 flex-row space-x-3">
            <StatCard
              title="Upcoming"
              value={mockUser.stats.upcomingTrips}
              icon="calendar"
            />
            <StatCard
              title="Completed"
              value={mockUser.stats.completedTrips}
              icon="checkmark-circle"
            />
          </View>
        </View>

        {/* Profile Information */}
        <View className="mx-4 mb-4">
          <Text className="text-gray-900 mb-3 text-lg font-semibold">
            <fbt desc="Profile info">Profile Information</fbt>
          </Text>
          <View className="rounded-lg bg-white">
            <ProfileItem icon="mail" label="Email" value={mockUser.email} />
            <ProfileItem icon="call" label="Phone" value={mockUser.phone} />
            <ProfileItem
              icon="location"
              label="Location"
              value={mockUser.location}
            />
            <ProfileItem
              icon="calendar"
              label="Member Since"
              value={new Date(mockUser.joinDate).toLocaleDateString()}
            />
          </View>
        </View>

        {/* Recent Trips */}
        <View className="mx-4 mb-4">
          <Text className="text-gray-900 mb-3 text-lg font-semibold">
            <fbt desc="Recent trips">Recent Trips</fbt>
          </Text>
          <View className="rounded-lg bg-white">
            {mockUser.recentTrips.map((trip, index) => (
              <Link
                key={trip.id}
                href={`/(app)/(tabs)/trips/${trip.id}`}
                asChild
              >
                <Pressable className="border-gray-100 flex-row items-center border-b px-4 py-3 last:border-b-0">
                  <Ionicons name="airplane" size={20} color={colors.purple} />
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-900 text-base">
                      {trip.title}
                    </Text>
                    <Text className="text-gray-600 text-sm">{trip.date}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.black}
                  />
                </Pressable>
              </Link>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View className="mx-4 mb-6">
          <View className="rounded-lg bg-white">
            <ProfileItem
              icon="shield-checkmark"
              label="Privacy & Security"
              value="Manage your privacy settings"
              onPress={() => {}}
            />
            <ProfileItem
              icon="help-circle"
              label="Help & Support"
              value="Get help with your account"
              onPress={() => {}}
            />
            <ProfileItem
              icon="log-out"
              label="Sign Out"
              value="Sign out of your account"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}
