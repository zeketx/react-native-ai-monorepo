/**
 * Alert Component
 *
 * A reusable alert component for displaying messages with different variants.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from './Text.js';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  dismissible?: boolean;
  message: string;
  onDismiss?: () => void;
  testID?: string;
  title?: string;
  variant: AlertVariant;
}

const Alert: React.FC<AlertProps> = ({
  dismissible = false,
  message,
  onDismiss,
  testID,
  title,
  variant,
}) => {
  const variantStyles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: { color: '#dc2626', name: 'alert-circle' as const },
      message: 'text-red-700',
      title: 'text-red-800',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: { color: '#2563eb', name: 'information-circle' as const },
      message: 'text-blue-700',
      title: 'text-blue-800',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: { color: '#16a34a', name: 'checkmark-circle' as const },
      message: 'text-green-700',
      title: 'text-green-800',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: { color: '#d97706', name: 'warning' as const },
      message: 'text-yellow-700',
      title: 'text-yellow-800',
    },
  };

  const styles = variantStyles[variant];

  return (
    <View
      className={`mb-4 rounded-lg border p-4 ${styles.container}`}
      testID={testID}
    >
      <View className="flex-row">
        <View className="mr-3 flex-shrink-0">
          <Ionicons
            color={styles.icon.color}
            name={styles.icon.name}
            size={20}
          />
        </View>

        <View className="flex-1">
          {title && (
            <Text
              className={`mb-1 text-sm font-semibold ${styles.title}`}
              testID={`${testID}-title`}
            >
              {title}
            </Text>
          )}

          <Text
            className={`text-sm ${styles.message}`}
            testID={`${testID}-message`}
          >
            {message}
          </Text>
        </View>

        {dismissible && (
          <TouchableOpacity
            className="ml-3 flex-shrink-0"
            onPress={onDismiss}
            testID={`${testID}-dismiss`}
          >
            <Ionicons color={styles.icon.color} name="close" size={18} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Alert;
