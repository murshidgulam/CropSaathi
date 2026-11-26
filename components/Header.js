
import React from 'react';
import { View, Text } from 'react-native';

export default function Header({ styles }) {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>🌱</Text>

      <View>
        <Text style={styles.brand}>CropSaathi</Text>
        <Text style={styles.tagline}>
          Your farming companion
        </Text>
      </View>

      <View style={styles.language}>
        <Text style={styles.languageText}>EN</Text>
      </View>
    </View>
  );
}
