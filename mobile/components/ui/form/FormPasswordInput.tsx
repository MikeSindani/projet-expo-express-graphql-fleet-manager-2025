import { Lock } from 'lucide-react-native';
import React from 'react';
import { TextInputProps } from 'react-native';
import { StyledInput } from '../StyledInput';

interface FormPasswordInputProps extends TextInputProps {
  label?: string;
  field: any;
}

export function FormPasswordInput({
  label,
  field,
  ...props
}: FormPasswordInputProps) {
  return (
    <StyledInput
      label={label}
      icon={Lock}
      value={field.state.value as string}
      onChangeText={(text: string) => field.handleChange(text)}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.map((e: any) => e?.toString() || "")}
      isPassword
      {...props}
    />
  );
}

