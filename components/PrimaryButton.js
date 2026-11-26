
import React from 'react';
import { Pressable, Text } from 'react-native';

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  styles,
}) {
  return (
    <Pressable
      style={[
        styles.button,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>
        {title}
      </Text>
    </Pressable>
  );
}
