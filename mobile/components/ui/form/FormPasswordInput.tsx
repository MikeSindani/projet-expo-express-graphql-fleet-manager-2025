import { FieldApi } from '@tanstack/react-form';
import { Eye, EyeOff, Lock } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { FormError } from './FormError';

interface FormPasswordInputProps extends TextInputProps {
  label?: string;
  field: FieldApi<any, any, any, any>;
}

export function FormPasswordInput({
  label,
  field,
  className,
  ...props
}: FormPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-6">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center border rounded-xl px-4 py-3 ${
          field.state.meta.errors.length > 0 ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <Lock size={20} color="#6b7280" />
        <TextInput
          className="flex-1 ml-3 text-base text-gray-900"
          value={field.state.value as string}
          onChangeText={(text) => field.handleChange(text)}
          onBlur={field.handleBlur}
          secureTextEntry={!showPassword}
          placeholderTextColor="#9ca3af"
          {...props}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? (
            <EyeOff size={20} color="#6b7280" />
          ) : (
            <Eye size={20} color="#6b7280" />
          )}
        </TouchableOpacity>
      </View>
      <FormError errors={field.state.meta.errors ? field.state.meta.errors.map(e => e?.toString() || "") : []} />
    </View>
  );
}
