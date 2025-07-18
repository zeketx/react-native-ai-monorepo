import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { fbs } from 'fbtee';
import { Pressable, ScrollView, View } from 'react-native';
import Button from 'src/ui/Button.tsx';
import colors from 'src/ui/colors.ts';
import Input from 'src/ui/Input.tsx';
import Text from 'src/ui/Text.tsx';

export default function AddTripModal() {
  const handleClose = () => {
    router.back();
  };

  const handleSave = () => {
    // TODO: Implement trip creation logic
    console.log('Save trip');
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: String(fbs('Add Trip', 'Add trip modal title')),
          headerLeft: () => (
            <Pressable onPress={handleClose} className="p-2">
              <Ionicons name="close" size={24} color={colors.black} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} className="p-2">
              <Text className="text-purple-600 font-medium">
                <fbs desc="Save button">Save</fbs>
              </Text>
            </Pressable>
          ),
          presentation: 'modal',
        }}
      />

      <ScrollView className="bg-gray-50 flex-1">
        <View className="p-4">
          <View className="mb-4 rounded-lg bg-white p-4">
            <Text className="text-gray-900 mb-4 text-lg font-semibold">
              <fbs desc="Trip details">Trip Details</fbs>
            </Text>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">
                <fbs desc="Trip title">Title</fbs>
              </Text>
              <Input
                placeholder={String(
                  fbs('Enter trip title', 'Trip title placeholder'),
                )}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">
                <fbs desc="Destination">Destination</fbs>
              </Text>
              <Input
                placeholder={String(
                  fbs('Enter destination', 'Destination placeholder'),
                )}
              />
            </View>

            <View className="mb-4 flex-row">
              <View className="mr-2 flex-1">
                <Text className="text-gray-700 mb-2 font-medium">
                  <fbs desc="Start date">Start Date</fbs>
                </Text>
                <Input
                  placeholder={String(fbs('Select date', 'Date placeholder'))}
                />
              </View>
              <View className="ml-2 flex-1">
                <Text className="text-gray-700 mb-2 font-medium">
                  <fbs desc="End date">End Date</fbs>
                </Text>
                <Input
                  placeholder={String(fbs('Select date', 'Date placeholder'))}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">
                <fbs desc="Description">Description</fbs>
              </Text>
              <Input
                placeholder={String(
                  fbs('Enter description', 'Description placeholder'),
                )}
              />
            </View>
          </View>

          <Button onPress={handleSave}>
            <fbs desc="Create trip">Create Trip</fbs>
          </Button>
        </View>
      </ScrollView>
    </>
  );
}
