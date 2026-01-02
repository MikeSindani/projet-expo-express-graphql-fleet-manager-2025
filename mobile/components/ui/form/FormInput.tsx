import { FieldApi } from '@tanstack/react-form';
import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { FormError } from './FormError';

interface FormInputProps extends TextInputProps {
  label?: string;
  field: FieldApi<any, any, any, any>; // Using generic FieldApi
  icon?: LucideIcon;
}

export function FormInput({
  label,
  field,
  icon: Icon,
  className,
  ...props
}: FormInputProps) {
  return (
    <View className="mb-4">
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
        {Icon && <Icon size={20} color="#6b7280" />}
        <TextInput
          className="flex-1 ml-3 text-base text-gray-900"
          value={field.state.value as string}
          onChangeText={(text) => field.handleChange(text)}
          onBlur={field.handleBlur}
          placeholderTextColor="#9ca3af"
          {...props}
        />
      </View>
      <FormError errors={field.state.meta.errors ? field.state.meta.errors.map(e => e?.toString() || "") : []} />
    </View>
  );
}
