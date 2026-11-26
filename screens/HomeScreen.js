
import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StatusBar,
  Pressable,
} from 'react-native';

export default function HomeScreen({
  crops,
  selectedCrop,
  setSelectedCrop,
  continueToPhoto,
  setScreen,
  styles,
  Header,
  PrimaryButton,
  Tip,
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.container}>
        <Header />

        <Text style={styles.greeting}>
          NAMASTE, FARMER 👋
        </Text>

        <Text style={styles.heading}>
          Healthy crops,{'\n'}
          <Text style={styles.green}>
            better tomorrow.
          </Text>
        </Text>

        <Text style={styles.subtitle}>
          Let's check your crop health and help protect
          your harvest.
        </Text>

        <View style={styles.card}>
          <Text style={styles.leaf}>🌿</Text>

          <Text style={styles.cardTitle}>
            Detect Crop Disease
          </Text>

          <Text style={styles.description}>
            Select your crop to begin checking its leaf health.
          </Text>

          <Text style={styles.section}>
            SELECT YOUR CROP
          </Text>

          <View style={styles.grid}>
            {crops.map(crop => {
              const selected = selectedCrop === crop.name;

              return (
                <Pressable
                  key={crop.name}
                  onPress={() => setSelectedCrop(crop.name)}
                  style={[
                    styles.crop,
                    { backgroundColor: crop.color },
                    selected && styles.selected,
                  ]}
                >
                  <Text style={styles.cropEmoji}>
                    {crop.emoji}
                  </Text>

                  <Text style={styles.cropName}>
                    {crop.name}
                  </Text>

                  {selected && (
                    <Text style={styles.tick}>✓</Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          <PrimaryButton
            title="Continue →"
            onPress={continueToPhoto}
          />
        </View>

        <Tip
          title="A little farming tip"
          message="Take a clear photo of the affected leaf in natural light for a better disease check."
        />

        <Pressable
          style={styles.historyLink}
          onPress={() => setScreen('history')}
        >
          <Text style={styles.linkText}>
            📋 View Scan History
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          Made with 💚 for our farmers
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
