import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import Button from 'src/ui/Button.tsx';
import colors from 'src/ui/colors.ts';
import Input from 'src/ui/Input.tsx';
import Text from 'src/ui/Text.tsx';

// Mock user data
const mockUser = {
  company: 'ClientSync Corp',
  email: 'john.doe@example.com',
  id: '1',
  location: 'San Francisco, CA',
  name: 'John Doe',
  phone: '+1 (555) 123-4567',
  title: 'Senior Business Analyst',
};

export default function EditProfileScreen() {
  const [profile, setProfile] = useState(mockUser);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully updated.',
        [{ text: 'OK' }],
      );
    }, 1000);
  };

  const handleCancel = () => {
    // Reset to original values
    setProfile(mockUser);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              className="mr-2 p-2"
              disabled={isLoading}
              onPress={handleSave}
            >
              <Text className="text-purple-600 font-medium">
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          ),
          title: String(
            fbs('Edit Profile', 'Edit profile screen header title'),
          ),
        }}
      />

      <ScrollView className="bg-gray-50 flex-1">
        <View className="p-4">
          {/* Profile Picture */}
          <View className="mb-6 items-center">
            <View className="bg-gray-200 h-24 w-24 items-center justify-center rounded-full">
              <Ionicons color={colors.black} name="person" size={48} />
            </View>
            <Pressable className="mt-3">
              <Text className="text-purple-600 font-medium">
                <fbt desc="Change photo">Change Photo</fbt>
              </Text>
            </Pressable>
          </View>

          {/* Personal Information */}
          <View className="mb-4 rounded-lg bg-white p-4">
            <Text className="text-gray-900 mb-4 text-lg font-semibold">
              <fbt desc="Personal info">Personal Information</fbt>
            </Text>

            <Input
              label="Full Name"
              leftIcon="person"
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, name: text }))
              }
              placeholder="Enter your full name"
              value={profile.name}
            />

            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              label="Email"
              leftIcon="mail"
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, email: text }))
              }
              placeholder="Enter your email"
              value={profile.email}
            />

            <Input
              keyboardType="phone-pad"
              label="Phone"
              leftIcon="call"
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, phone: text }))
              }
              placeholder="Enter your phone number"
              value={profile.phone}
            />

            <Input
              label="Location"
              leftIcon="location"
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, location: text }))
              }
              placeholder="Enter your location"
              value={profile.location}
            />
          </View>

          {/* Professional Information */}
          <View className="mb-4 rounded-lg bg-white p-4">
            <Text className="text-gray-900 mb-4 text-lg font-semibold">
              <fbt desc="Professional info">Professional Information</fbt>
            </Text>

            <Input
              label="Job Title"
              leftIcon="briefcase"
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, title: text }))
              }
              placeholder="Enter your job title"
              value={profile.title}
            />

            <Input
              label="Company"
              leftIcon="business"
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, company: text }))
              }
              placeholder="Enter your company"
              value={profile.company}
            />
          </View>

          {/* Action Buttons */}
          <View className="mt-4 flex-row space-x-3">
            <Button className="flex-1" onPress={handleCancel} variant="outline">
              <fbt desc="Cancel">Cancel</fbt>
            </Button>
            <Button className="flex-1" loading={isLoading} onPress={handleSave}>
              <fbt desc="Save changes">Save Changes</fbt>
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
