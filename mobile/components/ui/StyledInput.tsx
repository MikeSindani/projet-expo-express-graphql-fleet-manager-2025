import { useTheme } from '@/contexts/ThemeContext';
import { Eye, EyeOff, LucideIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface StyledInputProps extends TextInputProps {
  label?: string;
  icon?: LucideIcon;
  error?: string | string[];
  isPassword?: boolean;
}

export function StyledInput({
  label,
  icon: Icon,
  error,
  isPassword = false,
  className,
  ...props
}: StyledInputProps) {
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Array.isArray(error) ? error.length > 0 : !!error;
  const errorText = Array.isArray(error) ? error[0] : error;

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center border rounded-2xl px-4 py-3.5 transition-all ${
          hasError
            ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
            : isFocused
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-500'
              : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'
        }`}
      >
        {Icon && (
          <Icon
            size={20}
            color={
              hasError
                ? '#ef4444'
                : isFocused
                  ? '#3b82f6'
                  : isDark
                    ? '#9ca3af'
                    : '#6b7280'
            }
          />
        )}
        <TextInput
          className={`flex-1 ml-3 text-base text-gray-900 dark:text-gray-100 ${className || ''}`}
          placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff
                size={20}
                color={isDark ? '#9ca3af' : '#6b7280'}
              />
            ) : (
              <Eye
                size={20}
                color={isDark ? '#9ca3af' : '#6b7280'}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
      {hasError && (
        <Text className="text-red-500 text-xs mt-1.5 font-medium ml-1">
          {errorText}
        </Text>
      )}
    </View>
  );
}
