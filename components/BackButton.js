
import React from 'react';
import { Pressable, Text } from 'react-native';

export default function BackButton({
  title = '← Back',
  onPress,
  styles,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.backButton}
    >
      <Text style={styles.back}>
        {title}
      </Text>
    </Pressable>
  );
}
