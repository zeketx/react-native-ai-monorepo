import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { Image, Pressable, ScrollView, View } from 'react-native';
import Text from 'src/ui/Text.tsx';
import colors from 'src/ui/colors.ts';
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
    countries: 8
  },
  recentTrips: [
    { id: '1', title: 'Business Trip to Tokyo', date: '2024-07-15' },
    { id: '2', title: 'Client Meeting in New York', date: '2024-06-01' },
    { id: '3', title: 'Conference in London', date: '2024-08-10' }
  ]
};

const ProfileItem = ({ 
  icon, 
  label, 
  value, 
  onPress 
}: { 
  icon: string; 
  label: string; 
  value: string; 
  onPress?: () => void; 
}) => (
  <Pressable 
    className="flex-row items-center py-3 px-4 border-b border-gray-100"
    onPress={onPress}
  >
    <Ionicons name={icon as any} size={20} color={colors.black} />
    <View className="flex-1 ml-3">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-base text-gray-900">{value}</Text>
    </View>
    {onPress && (
      <Ionicons name="chevron-forward" size={20} color={colors.black} />
    )}
  </Pressable>
);

const StatCard = ({ 
  title, 
  value, 
  icon 
}: { 
  title: string; 
  value: number; 
  icon: string; 
}) => (
  <View className="bg-white rounded-lg p-4 flex-1 items-center">
    <Ionicons name={icon as any} size={24} color={colors.purple} />
    <Text className="text-2xl font-bold text-gray-900 mt-2">{value}</Text>
    <Text className="text-sm text-gray-600 text-center">{title}</Text>
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
                <Ionicons name="create-outline" size={24} color={colors.purple} />
              </Pressable>
            </Link>
          ),
        }}
      />
      
      <ScrollView className="flex-1 bg-gray-50">
        {/* Profile Header */}
        <View className="bg-white px-4 py-6">
          <View className="items-center">
            <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
              <Ionicons name="person" size={48} color={colors.black} />
            </View>
            <Text className="text-xl font-bold text-gray-900 mt-3">
              {mockUser.name}
            </Text>
            <Text className="text-gray-600">{mockUser.title}</Text>
            <Text className="text-gray-600">{mockUser.company}</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="px-4 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
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
          <View className="flex-row space-x-3 mt-3">
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
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            <fbt desc="Profile info">Profile Information</fbt>
          </Text>
          <View className="bg-white rounded-lg">
            <ProfileItem 
              icon="mail" 
              label="Email" 
              value={mockUser.email} 
            />
            <ProfileItem 
              icon="call" 
              label="Phone" 
              value={mockUser.phone} 
            />
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
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            <fbt desc="Recent trips">Recent Trips</fbt>
          </Text>
          <View className="bg-white rounded-lg">
            {mockUser.recentTrips.map((trip, index) => (
              <Link key={trip.id} href={`/(app)/(tabs)/trips/${trip.id}`} asChild>
                <Pressable className="flex-row items-center py-3 px-4 border-b border-gray-100 last:border-b-0">
                  <Ionicons name="airplane" size={20} color={colors.purple} />
                  <View className="flex-1 ml-3">
                    <Text className="text-base text-gray-900">{trip.title}</Text>
                    <Text className="text-sm text-gray-600">{trip.date}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.black} />
                </Pressable>
              </Link>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-lg">
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