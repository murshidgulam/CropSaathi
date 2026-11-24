import React, { useState, useEffect } from 'react';

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import * as ort from 'onnxruntime-react-native';

// Permanent storage key for scan history
const HISTORY_STORAGE_KEY = 'cropsaathi_scan_history';

const crops = [
  { name: 'Tomato', emoji: '🍅', color: '#FFF0E9' },
  { name: 'Potato', emoji: '🥔', color: '#F8F0DF' },
  { name: 'Maize', emoji: '🌽', color: '#FFF5D9' },
  { name: 'Rice', emoji: '🌾', color: '#EAF3E5' },
];

async function loadCropDiseaseModel() {
  try {
    const assets = await Asset.loadAsync(
      require('./assets/models/crop_disease_model.onnx')
    );

    const modelUri = assets[0].localUri;

    if (!modelUri) {
      throw new Error('Could not locate the ONNX model file.');
    }

    const session = await ort.InferenceSession.create(modelUri, {
      executionProviders: ['cpu'],
    });

    console.log('CropSaathi AI model loaded successfully!');
    console.log('Model inputs:', session.inputNames);
    console.log('Model outputs:', session.outputNames);

    return session;
  } catch (error) {
    console.error('CropSaathi model loading failed:', error);
    throw error;
  }
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [modelSession, setModelSession] = useState(null);

  // LOAD AI MODEL WHEN APP OPENS
useEffect(() => {
  let isActive = true;

  async function initializeModel() {
    try {
      const session = await loadCropDiseaseModel();

      if (isActive) {
        setModelSession(session);
      }
    } catch (error) {
      console.error('AI model initialization failed:', error);
    }
  }

  initializeModel();

  return () => {
    isActive = false;
  };
}, []);

  // LOAD SAVED HISTORY WHEN APP OPENS
  useEffect(() => {
    let isActive = true;

    async function loadHistory() {
      try {
        const savedHistory = await AsyncStorage.getItem(
          HISTORY_STORAGE_KEY
        );

        if (savedHistory !== null) {
          const parsedHistory = JSON.parse(savedHistory);

          if (Array.isArray(parsedHistory) && isActive) {
            setHistory(parsedHistory);
          }
        }
      } catch (error) {
        console.log('History loading error:', error);
        Alert.alert(
          'Storage error',
          'Could not load your saved scan history.'
        );
      } finally {
        if (isActive) {
          setHistoryLoaded(true);
        }
      }
    }

    loadHistory();

    return () => {
      isActive = false;
    };
  }, []);

  // SAVE HISTORY WHENEVER IT CHANGES
  useEffect(() => {
    if (!historyLoaded) {
      return;
    }

    async function saveHistory() {
      try {
        await AsyncStorage.setItem(
          HISTORY_STORAGE_KEY,
          JSON.stringify(history)
        );

        console.log('Scan history saved successfully.');
      } catch (error) {
        console.log('History saving error:', error);
        Alert.alert(
          'Storage error',
          'Could not save your scan history.'
        );
      }
    }

    saveHistory();
  }, [history, historyLoaded]);

  // Select crop
  function continueToPhoto() {
    if (!selectedCrop) {
      Alert.alert('Select a crop', 'Please select your crop first.');
      return;
    }

    setPhoto(null);
    setScreen('photo');
  }

  // Open camera
  async function openCamera() {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow camera access.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1,1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setPhoto(result.assets[0].uri);
        setScreen('preview');
      }
    } catch (error) {
      Alert.alert('Camera error', 'Unable to open the camera.');
    }
  }

  // Open gallery
  async function openGallery() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow photo library access.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1,1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setPhoto(result.assets[0].uri);
        setScreen('preview');
      }
    } catch (error) {
      Alert.alert('Gallery error', 'Unable to open your gallery.');
    }
  }

  // Open result screen.
  // Placeholder until the trained AI model is integrated.
  function detectDisease() {
    if (!photo) {
      Alert.alert('Photo missing', 'Please select a photo first.');
      return;
    }

    const newScan = {
      id: Date.now().toString(),
      crop: selectedCrop,
      disease: 'Awaiting AI analysis',
      date: new Date().toLocaleDateString(),
    };

    setHistory(previous => [newScan, ...previous]);
    setScreen('result');
  }

  // Start a new scan
  function startNewScan() {
    setPhoto(null);
    setSelectedCrop(null);
    setScreen('home');
  }

  // Header
  function Header() {
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

  // Main button
  function PrimaryButton({ title, onPress }) {
    return (
      <Pressable
        style={styles.button}
        onPress={onPress}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </Pressable>
    );
  }

  // Secondary button
  function SecondaryButton({ title, onPress }) {
    return (
      <Pressable
        style={styles.secondaryButton}
        onPress={onPress}
      >
        <Text style={styles.secondaryText}>{title}</Text>
      </Pressable>
    );
  }

  // Back button
  function BackButton({ title = '← Back', onPress }) {
    return (
      <Pressable onPress={onPress} style={styles.backButton}>
        <Text style={styles.back}>{title}</Text>
      </Pressable>
    );
  }

  // Farming tip
  function Tip({ title, message }) {
    return (
      <View style={styles.tip}>
        <Text style={styles.tipEmoji}>💡</Text>

        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>{title}</Text>
          <Text style={styles.tipText}>{message}</Text>
        </View>
      </View>
    );
  }

  // HOME SCREEN
  if (screen === 'home') {
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

            <PrimaryButton
              title="Continue to Disease Check →"
              onPress={detectDisease}
            />

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

  // RESULT SCREEN
  if (screen === 'result') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />

        <ScrollView contentContainerStyle={styles.container}>
          <Header />

          <BackButton
            title="← Back to photo"
            onPress={() => setScreen('preview')}
          />

          <Text style={styles.heading}>
            Scan Result
          </Text>

          <Text style={styles.subtitle}>
            Your crop photo has been received.
          </Text>

          <View style={styles.card}>
            {photo && (
              <Image
                source={{ uri: photo }}
                style={styles.previewImage}
              />
            )}

            <Text style={styles.resultIcon}>🌱</Text>

            <Text style={styles.cardTitle}>
              {selectedCrop} leaf scan
            </Text>

            <Text style={styles.description}>
              Your photo is ready for AI analysis.
            </Text>

            <View style={styles.statusBox}>
              <Text style={styles.statusTitle}>
                AI model not connected yet
              </Text>

              <Text style={styles.statusText}>
                Mohan's trained CropSaathi model is still
                being prepared. No disease prediction has
                been made.
              </Text>
            </View>

            <Text style={styles.section}>
              DISEASE PREDICTION
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                Prediction
              </Text>

              <Text style={styles.infoText}>
                Waiting for AI model integration.
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                Confidence
              </Text>

              <Text style={styles.infoText}>
                Not available yet.
              </Text>
            </View>

            <Text style={styles.section}>
              FARMER GUIDANCE
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                Symptoms
              </Text>

              <Text style={styles.infoText}>
                Crop-specific symptoms will appear after
                the AI model identifies a disease.
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                Prevention and treatment
              </Text>

              <Text style={styles.infoText}>
                Verified guidance will be displayed here
                after the disease prediction is available.
              </Text>
            </View>

            <Text style={styles.disclaimer}>
              AI guidance is not a final diagnosis.
              Confirm with an agriculture expert before
              using any pesticide.
            </Text>

            <PrimaryButton
              title="Start New Scan"
              onPress={startNewScan}
            />

            <SecondaryButton
              title="View Scan History"
              onPress={() => setScreen('history')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // HISTORY SCREEN
  if (screen === 'history') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />

        <ScrollView contentContainerStyle={styles.container}>
          <Header />

          <BackButton
            title="← Back to Home"
            onPress={() => setScreen('home')}
          />

          <Text style={styles.heading}>
            Scan History
          </Text>

          <Text style={styles.subtitle}>
            Your previous photo scans.
          </Text>

          {!historyLoaded ? (
            <View style={styles.card}>
              <ActivityIndicator size="large" color="#347B43" />
              <Text style={styles.description}>
                Loading your saved scans...
              </Text>
            </View>
          ) : history.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.leaf}>📋</Text>

              <Text style={styles.cardTitle}>
                No scans yet
              </Text>

              <Text style={styles.description}>
                Your scans will appear here after you
                complete a photo selection.
              </Text>
            </View>
          ) : (
            history.map(item => (
              <View style={styles.historyCard} key={item.id}>
                <Text style={styles.cardTitle}>
                  {item.crop}
                </Text>

                <Text style={styles.description}>
                  {item.disease}
                </Text>

                <Text style={styles.date}>
                  {item.date}
                </Text>
              </View>
            ))
          )}

          <PrimaryButton
            title="Start New Scan"
            onPress={startNewScan}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F9F4',
  },

  container: {
    padding: 22,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },

  logo: {
    fontSize: 36,
    marginRight: 12,
  },

  brand: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#244D32',
  },

  tagline: {
    fontSize: 12,
    color: '#718274',
  },

  language: {
    marginLeft: 'auto',
    backgroundColor: '#E8EFE5',
    padding: 12,
    borderRadius: 12,
  },

  languageText: {
    color: '#315B3B',
    fontWeight: 'bold',
  },

  greeting: {
    color: '#63866A',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },

  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#203B29',
    lineHeight: 40,
    marginBottom: 10,
  },

  green: {
    color: '#43844D',
  },

  subtitle: {
    color: '#758078',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 25,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },

  leaf: {
    fontSize: 32,
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#263D2B',
    marginTop: 8,
    marginBottom: 6,
  },

  description: {
    color: '#7A857C',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },

  section: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#758477',
    marginTop: 18,
    marginBottom: 12,
    letterSpacing: 1,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  crop: {
    width: '48%',
    height: 125,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  selected: {
    borderColor: '#43844D',
  },

  cropEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },

  cropName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#354739',
  },

  tick: {
    position: 'absolute',
    top: 8,
    right: 12,
    color: '#347B43',
    fontWeight: 'bold',
    fontSize: 18,
  },

  button: {
    backgroundColor: '#347B43',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  secondaryButton: {
    backgroundColor: '#EAF2E6',
    borderRadius: 14,
    padding: 17,
    alignItems: 'center',
    marginTop: 12,
  },

  secondaryText: {
    color: '#347B43',
    fontSize: 15,
    fontWeight: 'bold',
  },

  tip: {
    flexDirection: 'row',
    backgroundColor: '#EAF2E6',
    borderRadius: 18,
    padding: 17,
    marginTop: 5,
  },

  tipEmoji: {
    fontSize: 27,
    marginRight: 13,
  },

  tipTitle: {
    fontWeight: 'bold',
    color: '#34583A',
    fontSize: 16,
    marginBottom: 5,
  },

  tipText: {
    color: '#607461',
    fontSize: 13,
    lineHeight: 20,
  },

  footer: {
    textAlign: 'center',
    color: '#8A968B',
    fontSize: 13,
    marginTop: 25,
  },

  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },

  back: {
    color: '#347B43',
    fontSize: 16,
    fontWeight: 'bold',
  },

  previewImage: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    resizeMode: 'cover',
    marginBottom: 15,
    backgroundColor: '#F0F5EF',
  },

  resultIcon: {
    fontSize: 38,
    marginTop: 8,
  },

  statusBox: {
    backgroundColor: '#FFF5D9',
    borderRadius: 14,
    padding: 16,
    marginVertical: 12,
  },

  statusTitle: {
    color: '#765B16',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  statusText: {
    color: '#765B16',
    fontSize: 13,
    lineHeight: 20,
  },

  infoBox: {
    backgroundColor: '#F0F5ED',
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  infoTitle: {
    color: '#315B3B',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 7,
  },

  infoText: {
    color: '#68796A',
    fontSize: 14,
    lineHeight: 21,
  },

  disclaimer: {
    color: '#7A857C',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginVertical: 12,
  },

  historyLink: {
    alignItems: 'center',
    padding: 16,
  },

  linkText: {
    color: '#347B43',
    fontWeight: 'bold',
    fontSize: 15,
  },

  historyCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
  },

  date: {
    color: '#8A968B',
    fontSize: 12,
  },
});