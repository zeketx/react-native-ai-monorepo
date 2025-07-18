/**
 * Enhanced Input Component for Forms
 *
 * A reusable input component with validation support, icons, and error states.
 */

import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import Text from './Text.js';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  editable?: boolean;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  testID?: string;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  maxLength?: number;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      onBlur,
      secureTextEntry = false,
      keyboardType = 'default',
      autoCapitalize = 'none',
      autoCorrect = false,
      editable = true,
      error,
      leftIcon,
      rightIcon,
      onRightIconPress,
      testID,
      returnKeyType = 'done',
      onSubmitEditing,
      maxLength,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const hasError = Boolean(error);
    const showPasswordToggle = secureTextEntry && value && value.length > 0;

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
      onBlur?.();
    };

    return (
      <View className="mb-4">
        {label && (
          <Text className="text-gray-700 mb-2 text-sm font-medium">
            {label}
          </Text>
        )}

        <View
          className={`relative flex-row items-center rounded-lg border bg-white ${
            hasError
              ? 'border-red-300 bg-red-50'
              : isFocused
                ? 'border-blue-500'
                : 'border-gray-300'
          } ${!editable ? 'bg-gray-50' : ''} `}
        >
          {leftIcon && (
            <View className="absolute left-3 z-10">
              <Ionicons
                name={leftIcon}
                size={20}
                color={hasError ? '#ef4444' : isFocused ? '#3b82f6' : '#6b7280'}
              />
            </View>
          )}

          <TextInput
            ref={ref}
            className={`text-gray-900 flex-1 p-4 text-base ${leftIcon ? 'pl-12' : ''} ${showPasswordToggle || rightIcon ? 'pr-12' : ''} `}
            placeholder={placeholder}
            placeholderTextColor={hasError ? '#ef4444' : '#9ca3af'}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            editable={editable}
            testID={testID}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            maxLength={maxLength}
            selectionColor="#3b82f6"
          />

          {(showPasswordToggle || rightIcon) && (
            <TouchableOpacity
              className="absolute right-3 z-10 p-1"
              onPress={
                showPasswordToggle ? togglePasswordVisibility : onRightIconPress
              }
              testID={
                showPasswordToggle
                  ? `${testID}-password-toggle`
                  : `${testID}-right-icon`
              }
            >
              <Ionicons
                name={
                  showPasswordToggle
                    ? isPasswordVisible
                      ? 'eye-off'
                      : 'eye'
                    : rightIcon!
                }
                size={20}
                color={hasError ? '#ef4444' : isFocused ? '#3b82f6' : '#6b7280'}
              />
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <View className="mt-1 flex-row items-center">
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
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
  },
);

Input.displayName = 'Input';

export default Input;
