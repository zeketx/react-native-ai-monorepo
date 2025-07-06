/**
 * Alert Component
 * 
 * A reusable alert component for displaying messages with different variants.
 */

import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import Text from './Text.js'

export type AlertVariant = 'success' | 'error' | 'warning' | 'info'

export interface AlertProps {
  variant: AlertVariant
  title?: string
  message: string
  dismissible?: boolean
  onDismiss?: () => void
  testID?: string
}

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  dismissible = false,
  onDismiss,
  testID,
}) => {
  const variantStyles = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: { name: 'checkmark-circle' as const, color: '#16a34a' },
      title: 'text-green-800',
      message: 'text-green-700',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: { name: 'alert-circle' as const, color: '#dc2626' },
      title: 'text-red-800',
      message: 'text-red-700',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: { name: 'warning' as const, color: '#d97706' },
      title: 'text-yellow-800',
      message: 'text-yellow-700',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: { name: 'information-circle' as const, color: '#2563eb' },
      title: 'text-blue-800',
      message: 'text-blue-700',
    },
  }

  const styles = variantStyles[variant]

  return (
    <View
      className={`border rounded-lg p-4 mb-4 ${styles.container}`}
      testID={testID}
    >
      <View className="flex-row">
        <View className="flex-shrink-0 mr-3">
          <Ionicons
            name={styles.icon.name}
            size={20}
            color={styles.icon.color}
          />
        </View>
        
        <View className="flex-1">
          {title && (
            <Text
              className={`font-semibold text-sm mb-1 ${styles.title}`}
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
            className="flex-shrink-0 ml-3"
            onPress={onDismiss}
            testID={`${testID}-dismiss`}
          >
            <Ionicons
              name="close"
              size={18}
              color={styles.icon.color}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default Alert