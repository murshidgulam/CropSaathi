
import React from 'react';
import { Pressable, Text } from 'react-native';

export default function SecondaryButton({
  title,
  onPress,
  styles,
}) {
  return (
    <Pressable
      style={styles.secondaryButton}
      onPress={onPress}
    >
      <Text style={styles.secondaryText}>
        {title}
      </Text>
    </Pressable>
  );
}
