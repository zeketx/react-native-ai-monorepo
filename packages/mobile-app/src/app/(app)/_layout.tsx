import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Redirect, Stack } from 'expo-router';
import { Fragment } from 'react';
import useViewerContext from 'src/user/useViewerContext.tsx';

function TabLayout() {
  const { isAuthenticated, locale } = useViewerContext();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Fragment key={locale}>
      <BottomSheetModalProvider>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              contentStyle: {
                backgroundColor: 'transparent',
              },
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="add-trip"
            options={{
              presentation: 'modal',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="support"
            options={{
              presentation: 'modal',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="about"
            options={{
              presentation: 'modal',
              headerShown: true,
            }}
          />
        </Stack>
      </BottomSheetModalProvider>
    </Fragment>
  );
}

export default TabLayout;
