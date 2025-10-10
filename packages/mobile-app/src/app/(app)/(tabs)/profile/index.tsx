import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { Pressable, ScrollView, View } from 'react-native';
import colors from 'src/ui/colors.ts';
import Text from 'src/ui/Text.tsx';
import useViewerContext from 'src/user/useViewerContext.tsx';

// Mock user data
const mockUser = {
  avatar: 'https://via.placeholder.com/150',
  company: 'ClientSync Corp',
  email: 'john.doe@example.com',
  id: '1',
  joinDate: '2023-01-15',
  location: 'San Francisco, CA',
  name: 'John Doe',
  phone: '+1 (555) 123-4567',
  recentTrips: [
    { date: '2024-07-15', id: '1', title: 'Business Trip to Tokyo' },
    { date: '2024-06-01', id: '2', title: 'Client Meeting in New York' },
    { date: '2024-08-10', id: '3', title: 'Conference in London' },
  ],
  stats: {
    completedTrips: 9,
    countries: 8,
    totalTrips: 12,
    upcomingTrips: 3,
  },
  title: 'Senior Business Analyst',
};

const ProfileItem = ({
  icon,
  label,
  onPress,
  value,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
  value: string;
}) => (
  <Pressable
    className="border-gray-100 flex-row items-center border-b px-4 py-3"
    onPress={onPress}
  >
    <Ionicons color={colors.black} name={icon as any} size={20} />
    <View className="ml-3 flex-1">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-gray-900 text-base">{value}</Text>
    </View>
    {onPress && (
      <Ionicons color={colors.black} name="chevron-forward" size={20} />
    )}
  </Pressable>
);

const StatCard = ({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: number;
}) => (
  <View className="flex-1 items-center rounded-lg bg-white p-4">
    <Ionicons color={colors.purple} name={icon as any} size={24} />
    <Text className="text-gray-900 mt-2 text-2xl font-bold">{value}</Text>
    <Text className="text-gray-600 text-center text-sm">{title}</Text>
  </View>
);

export default function ProfileScreen() {
  const { isAuthenticated: _isAuthenticated } = useViewerContext();

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link asChild href="/(app)/(tabs)/profile/edit">
              <Pressable className="mr-2 p-2">
                <Ionicons
                  color={colors.purple}
                  name="create-outline"
                  size={24}
                />
              </Pressable>
            </Link>
          ),
          title: String(fbs('Profile', 'Profile screen header title')),
        }}
      />

      <ScrollView className="bg-gray-50 flex-1">
        {/* Profile Header */}
        <View className="bg-white px-4 py-6">
          <View className="items-center">
            <View className="bg-gray-200 h-24 w-24 items-center justify-center rounded-full">
              <Ionicons color={colors.black} name="person" size={48} />
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
              icon="airplane"
              title="Total Trips"
              value={mockUser.stats.totalTrips}
            />
            <StatCard
              icon="globe"
              title="Countries"
              value={mockUser.stats.countries}
            />
          </View>
          <View className="mt-3 flex-row space-x-3">
            <StatCard
              icon="calendar"
              title="Upcoming"
              value={mockUser.stats.upcomingTrips}
            />
            <StatCard
              icon="checkmark-circle"
              title="Completed"
              value={mockUser.stats.completedTrips}
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
                asChild
                href={`/(app)/(tabs)/trips/${trip.id}`}
                key={trip.id}
              >
                <Pressable className="border-gray-100 flex-row items-center border-b px-4 py-3 last:border-b-0">
                  <Ionicons color={colors.purple} name="airplane" size={20} />
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-900 text-base">
                      {trip.title}
                    </Text>
                    <Text className="text-gray-600 text-sm">{trip.date}</Text>
                  </View>
                  <Ionicons
                    color={colors.black}
                    name="chevron-forward"
                    size={20}
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
              onPress={() => {}}
              value="Manage your privacy settings"
            />
            <ProfileItem
              icon="help-circle"
              label="Help & Support"
              onPress={() => {}}
              value="Get help with your account"
            />
            <ProfileItem
              icon="log-out"
              label="Sign Out"
              onPress={() => {}}
              value="Sign out of your account"
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}
