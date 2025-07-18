/**
 * Enhanced Button Component
 *
 * A reusable button component with different variants, sizes, and states.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import Text from './Text.js';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  testID,
  ...props
}) => {
  const isDisabled = disabled || loading;

  // Base styles
  const baseStyles = 'flex-row items-center justify-center rounded-lg';

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  // Variant styles
  const variantStyles = {
    primary: isDisabled ? 'bg-gray-300' : 'bg-blue-600 active:bg-blue-700',
    secondary: isDisabled ? 'bg-gray-300' : 'bg-gray-600 active:bg-gray-700',
    outline: isDisabled
      ? 'border border-gray-300 bg-white'
      : 'border border-blue-600 bg-white active:bg-blue-50',
    ghost: isDisabled ? 'bg-transparent' : 'bg-transparent active:bg-gray-100',
    danger: isDisabled ? 'bg-gray-300' : 'bg-red-600 active:bg-red-700',
  };

  // Text color styles
  const textColorStyles = {
    primary: isDisabled ? 'text-gray-500' : 'text-white',
    secondary: isDisabled ? 'text-gray-500' : 'text-white',
    outline: isDisabled ? 'text-gray-400' : 'text-blue-600',
    ghost: isDisabled ? 'text-gray-400' : 'text-gray-700',
    danger: isDisabled ? 'text-gray-500' : 'text-white',
  };

  // Text size styles
  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Icon color
  const getIconColor = () => {
    if (isDisabled) return '#9ca3af';

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#ffffff';
      case 'outline':
        return '#2563eb';
      case 'ghost':
        return '#374151';
      default:
        return '#374151';
    }
  };

  // Icon size
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'md':
        return 18;
      case 'lg':
        return 20;
      default:
        return 18;
    }
  };

  const finalClassName = [
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <TouchableOpacity
      className={finalClassName}
      disabled={isDisabled}
      testID={testID}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getIconColor()}
          testID={`${testID}-loading`}
        />
      ) : (
        <>
          {leftIcon && !loading && (
            <Ionicons
              name={leftIcon}
              size={getIconSize()}
              color={getIconColor()}
              style={{ marginRight: 8 }}
            />
          )}

          <Text
            className={`font-semibold ${textColorStyles[variant]} ${textSizeStyles[size]}`}
            testID={`${testID}-text`}
          >
            {children}
          </Text>

          {rightIcon && !loading && (
            <Ionicons
              name={rightIcon}
              size={getIconSize()}
              color={getIconColor()}
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
