
import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

export default function ScanScreen({
  screen,
  selectedCrop,
  photo,
  setScreen,
  openCamera,
  openGallery,
  isPredicting,
  detectDisease,
  modelSession,
  styles,
  Header,
  PrimaryButton,
  SecondaryButton,
  BackButton,
  Tip,
}) {
  // PHOTO UPLOAD SCREEN
  if (screen === 'photo') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />

        <ScrollView contentContainerStyle={styles.container}>
          <Header />

          <BackButton onPress={() => setScreen('home')} />

          <Text style={styles.heading}>
            Add leaf photo
          </Text>

          <Text style={styles.subtitle}>
            Selected crop: {selectedCrop}
          </Text>

          <View style={styles.card}>
            <Text style={styles.leaf}>📸</Text>

            <Text style={styles.cardTitle}>
              Choose your photo
            </Text>

            <Text style={styles.description}>
              Take a new picture or select an existing leaf photo.
            </Text>

            <PrimaryButton
              title="📷 Open Camera"
              onPress={openCamera}
            />

            <SecondaryButton
              title="🖼 Choose from Gallery"
              onPress={openGallery}
            />
          </View>

          <Tip
            title="Photo tip"
            message="Keep the leaf in focus and use natural daylight."
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // PHOTO PREVIEW SCREEN
  if (screen === 'preview') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />

        <ScrollView contentContainerStyle={styles.container}>
          <Header />

          <BackButton onPress={() => setScreen('photo')} />

          <Text style={styles.heading}>
            Review your photo
          </Text>

          <Text style={styles.subtitle}>
            Crop selected: {selectedCrop}
          </Text>

          <View style={styles.card}>
            {photo && (
              <Image
                source={{ uri: photo }}
                style={styles.previewImage}
              />
            )}

            <Text style={styles.cardTitle}>
              Photo ready!
            </Text>

            <Text style={styles.description}>
              Check that the leaf is clearly visible.
            </Text>

            {isPredicting ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator
                  size="large"
                  color="#347B43"
                />

                <Text style={styles.loadingText}>
                  Analysing your leaf photo...
                </Text>
              </View>
            ) : (
              <PrimaryButton
                title="Continue to Disease Check →"
                onPress={detectDisease}
                disabled={!modelSession}
              />
            )}

            {!modelSession && (
              <Text style={styles.loadingText}>
                Waiting for the AI model to load...
              </Text>
            )}

            <SecondaryButton
              title="Choose another photo"
              onPress={() => setScreen('photo')}
            />
          </View>

          <Tip
            title="Before continuing"
            message="Make sure your photo is clear and the affected leaf is visible."
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}
