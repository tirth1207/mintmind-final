import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/store/AppStateProvider';
import Colors from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const colors = Colors[theme];

  const getButtonStyle = (): ViewStyle => {
    if (disabled) {
      return { backgroundColor: colors.border, borderColor: colors.border };
    }

    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary, borderColor: colors.primary };
      case 'secondary':
        return { backgroundColor: colors.secondary, borderColor: colors.secondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: colors.primary };
      default:
        return { backgroundColor: colors.primary, borderColor: colors.primary };
    }
  };

  const getTextStyle = (): TextStyle => {
    if (disabled) {
      return { color: colors.textSecondary };
    }

    return variant === 'outline' ? { color: colors.primary } : { color: '#FFFFFF' };
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : '#FFFFFF'} />
      ) : (
        <Text style={[styles.text, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
