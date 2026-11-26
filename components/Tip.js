
import React from 'react';
import { View, Text } from 'react-native';

export default function Tip({ title, message, styles }) {
  return (
    <View style={styles.tip}>
      <Text style={styles.tipEmoji}>💡</Text>

      <View style={{ flex: 1 }}>
        <Text style={styles.tipTitle}>
          {title}
        </Text>

        <Text style={styles.tipText}>
          {message}
        </Text>
      </View>
    </View>
  );
}
