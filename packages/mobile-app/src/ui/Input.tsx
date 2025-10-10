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
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  editable?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  label?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  maxLength?: number;
  onBlur?: () => void;
  onChangeText?: (text: string) => void;
  onRightIconPress?: () => void;
  onSubmitEditing?: () => void;
  placeholder?: string;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  rightIcon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  testID?: string;
  value?: string;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      autoCapitalize = 'none',
      autoCorrect = false,
      editable = true,
      error,
      keyboardType = 'default',
      label,
      leftIcon,
      maxLength,
      onBlur,
      onChangeText,
      onRightIconPress,
      onSubmitEditing,
      placeholder,
      returnKeyType = 'done',
      rightIcon,
      secureTextEntry = false,
      testID,
      value,
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
                color={hasError ? '#ef4444' : isFocused ? '#3b82f6' : '#6b7280'}
                name={leftIcon}
                size={20}
              />
            </View>
          )}

          <TextInput
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            className={`text-gray-900 flex-1 p-4 text-base ${leftIcon ? 'pl-12' : ''} ${showPasswordToggle || rightIcon ? 'pr-12' : ''} `}
            editable={editable}
            keyboardType={keyboardType}
            maxLength={maxLength}
            onBlur={handleBlur}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onSubmitEditing={onSubmitEditing}
            placeholder={placeholder}
            placeholderTextColor={hasError ? '#ef4444' : '#9ca3af'}
            ref={ref}
            returnKeyType={returnKeyType}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            selectionColor="#3b82f6"
            testID={testID}
            value={value}
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
                color={hasError ? '#ef4444' : isFocused ? '#3b82f6' : '#6b7280'}
                name={
                  showPasswordToggle
                    ? isPasswordVisible
                      ? 'eye-off'
                      : 'eye'
                    : rightIcon!
                }
                size={20}
              />
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <View className="mt-1 flex-row items-center">
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
  },
);

Input.displayName = 'Input';

export default Input;
