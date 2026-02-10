import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { TextInputProps } from 'react-native';
import { StyledInput } from '../StyledInput';

interface FormInputProps extends TextInputProps {
  label?: string;
  field: any;
  icon?: LucideIcon;
}

export function FormInput({
  label,
  field,
  icon,
  ...props
}: FormInputProps) {
  return (
    <StyledInput
      label={label}
      icon={icon}
      value={field.state.value as string}
      onChangeText={(text: string) => field.handleChange(text)}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.map((e: any) => e?.toString() || "")}
      {...props}
    />
  );
}

