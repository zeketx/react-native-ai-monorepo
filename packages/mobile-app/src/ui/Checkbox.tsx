/**
 * Checkbox Component
 *
 * A reusable checkbox component for forms.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from './Text.js';

export interface CheckboxProps {
  checked: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
  onPress: () => void;
  testID?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  disabled = false,
  error,
  label,
  onPress,
  testID,
}) => {
  const hasError = Boolean(error);

  return (
    <View className="mb-4">
      <TouchableOpacity
        className="flex-row items-center"
        disabled={disabled}
        onPress={onPress}
        testID={testID}
      >
        <View
          className={`mr-3 h-5 w-5 items-center justify-center rounded border-2 ${
            checked
              ? hasError
                ? 'bg-red-600 border-red-600'
                : 'bg-blue-600 border-blue-600'
              : hasError
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-white'
          } ${disabled ? 'opacity-50' : ''} `}
        >
          {checked && <Ionicons color="#ffffff" name="checkmark" size={14} />}
        </View>

        {label && (
          <Text
            className={`flex-1 text-base ${hasError ? 'text-red-700' : 'text-gray-700'} ${disabled ? 'opacity-50' : ''} `}
          >
            {label}
          </Text>
        )}
      </TouchableOpacity>

      {error && (
        <View className="ml-8 mt-1 flex-row items-center">
          <Ionicons color="#ef4444" name="alert-circle" size={16} />
          <Text
            className="text-red-600 ml-1 text-sm"
            testID={`${testID}-error`}
          >
            {error}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Checkbox;
