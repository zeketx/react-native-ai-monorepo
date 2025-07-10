import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { fbs } from 'fbtee';
import { Pressable, View } from 'react-native';
import getLocale from 'src/i18n/getLocale.tsx';
import colors from 'src/ui/colors.ts';
import Text from 'src/ui/Text.tsx';
import useViewerContext from 'src/user/useViewerContext.tsx';

export default function TabLayout() {
  const { locale, setLocale } = useViewerContext();

  return (
    <Tabs
      screenOptions={{
        sceneStyle: {
          backgroundColor: 'transparent',
        },
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.black,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="trips"
        options={{
          headerRight: () => (
            <Pressable
              className="mr-2 rounded px-4 py-0"
              onPress={() => setLocale(locale === 'ja_JP' ? 'en_US' : 'ja_JP')}
            >
              {({ pressed }) => (
                <View
                  style={{
                    opacity: pressed ? 0.5 : 1,
                  }}
                >
                  <Text>{getLocale().split('_')[0]}</Text>
                </View>
              )}
            </Pressable>
          ),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'airplane' : 'airplane-outline'}
              size={24}
              color={color}
            />
          ),
          title: String(fbs('Trips', 'Trips tab title')),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
          title: String(fbs('Profile', 'Profile tab title')),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={24}
              color={color}
            />
          ),
          title: String(fbs('Settings', 'Settings tab title')),
        }}
      />
    </Tabs>
  );
}
