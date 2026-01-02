import { Text } from 'react-native';

interface FormErrorProps {
  errors?: string[];
}

export function FormError({ errors }: FormErrorProps) {
  if (!errors || errors.length === 0) return null;

  return (
    <Text className="text-red-500 text-sm mt-1 ml-1">
      {errors.join(', ')}
    </Text>
  );
}
