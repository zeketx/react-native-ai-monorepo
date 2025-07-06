/**
 * Checkbox Component
 * 
 * A reusable checkbox component for forms.
 */

import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import Text from './Text.js'

export interface CheckboxProps {
  label?: string
  checked: boolean
  onPress: () => void
  disabled?: boolean
  error?: string
  testID?: string
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onPress,
  disabled = false,
  error,
  testID,
}) => {
  const hasError = Boolean(error)

  return (
    <View className="mb-4">
      <TouchableOpacity
        className="flex-row items-center"
        onPress={onPress}
        disabled={disabled}
        testID={testID}
      >
        <View
          className={`
            w-5 h-5 mr-3 rounded border-2 items-center justify-center
            ${checked
              ? hasError
                ? 'bg-red-600 border-red-600'
                : 'bg-blue-600 border-blue-600'
              : hasError
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-white'
            }
            ${disabled ? 'opacity-50' : ''}
          `}
        >
          {checked && (
            <Ionicons
              name="checkmark"
              size={14}
              color="#ffffff"
            />
          )}
        </View>
        
        {label && (
          <Text
            className={`
              flex-1 text-base
              ${hasError ? 'text-red-700' : 'text-gray-700'}
              ${disabled ? 'opacity-50' : ''}
            `}
          >
            {label}
          </Text>
        )}
      </TouchableOpacity>

      {error && (
        <View className="mt-1 ml-8 flex-row items-center">
          <Ionicons name="alert-circle" size={16} color="#ef4444" />
          <Text className="text-red-600 text-sm ml-1" testID={`${testID}-error`}>
            {error}
          </Text>
        </View>
      )}
    </View>
  )
}

export default Checkbox