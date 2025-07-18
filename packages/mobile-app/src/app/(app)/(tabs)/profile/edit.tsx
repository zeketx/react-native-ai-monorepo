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
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  title: 'Senior Business Analyst',
  company: 'ClientSync Corp',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
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
          title: String(
            fbs('Edit Profile', 'Edit profile screen header title'),
          ),
          headerRight: () => (
            <Pressable
              className="mr-2 p-2"
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text className="text-purple-600 font-medium">
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView className="bg-gray-50 flex-1">
        <View className="p-4">
          {/* Profile Picture */}
          <View className="mb-6 items-center">
            <View className="bg-gray-200 h-24 w-24 items-center justify-center rounded-full">
              <Ionicons name="person" size={48} color={colors.black} />
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
              value={profile.name}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, name: text }))
              }
              placeholder="Enter your full name"
              leftIcon="person"
            />

            <Input
              label="Email"
              value={profile.email}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, email: text }))
              }
              placeholder="Enter your email"
              keyboardType="email-address"
              leftIcon="mail"
              autoCapitalize="none"
            />

            <Input
              label="Phone"
              value={profile.phone}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, phone: text }))
              }
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              leftIcon="call"
            />

            <Input
              label="Location"
              value={profile.location}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, location: text }))
              }
              placeholder="Enter your location"
              leftIcon="location"
            />
          </View>

          {/* Professional Information */}
          <View className="mb-4 rounded-lg bg-white p-4">
            <Text className="text-gray-900 mb-4 text-lg font-semibold">
              <fbt desc="Professional info">Professional Information</fbt>
            </Text>

            <Input
              label="Job Title"
              value={profile.title}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, title: text }))
              }
              placeholder="Enter your job title"
              leftIcon="briefcase"
            />

            <Input
              label="Company"
              value={profile.company}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, company: text }))
              }
              placeholder="Enter your company"
              leftIcon="business"
            />
          </View>

          {/* Action Buttons */}
          <View className="mt-4 flex-row space-x-3">
            <Button variant="outline" onPress={handleCancel} className="flex-1">
              <fbt desc="Cancel">Cancel</fbt>
            </Button>
            <Button onPress={handleSave} loading={isLoading} className="flex-1">
              <fbt desc="Save changes">Save Changes</fbt>
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
