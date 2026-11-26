
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

import diseaseGuidance from './diseaseGuidance';
import {
  preprocessLeafImage,
  checkImageQuality,
} from './utils/imagePreprocessing';

const diseaseLabels = require('./assets/models/labels.json');

const HISTORY_STORAGE_KEY = 'cropsaathi_scan_history';
const API_BASE_URL = 'http://10.0.2.2:3000';

async function saveScanToBackend(scan) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        crop: scan.crop,
        disease: scan.disease,
        predictedClass: scan.predictedClass,
        confidence: scan.confidence,
        date: new Date().toISOString(),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Could not save scan.');
    }

    console.log('Scan saved to backend:', result.scanId);
  } catch (error) {
    console.error('Backend scan saving failed:', error.message);
  }
}

// Available crops
const crops = [
  { name: 'Tomato', emoji: '🍅', color: '#FFF0E9' },
  { name: 'Potato', emoji: '🥔', color: '#F8F0DF' },
  { name: 'Maize', emoji: '🌽', color: '#FFF5D9' },
  { name: 'Rice', emoji: '🌾', color: '#EAF3E5' },
];

console.log(
  'CropSaathi disease guidance entries:',
  Object.keys(diseaseGuidance).length
);

// Load ONNX model
async function loadCropDiseaseModel() {
  try {
    const assets = await Asset.loadAsync(
      require('./assets/models/mohan_model.onnx')
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
  const [predictedClass, setPredictedClass] = useState(null);
  const [predictionConfidence, setPredictionConfidence] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Find guidance for the predicted disease
  const currentDiseaseGuidance = predictedClass
    ? diseaseGuidance[predictedClass] || null
    : null;

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

  // SELECT CROP AND CONTINUE
  function continueToPhoto() {
    if (!selectedCrop) {
      Alert.alert('Select a crop', 'Please select your crop first.');
      return;
    }

    setPhoto(null);
    setPredictedClass(null);
    setPredictionConfidence(null);
    setScreen('photo');
  }

  // OPEN CAMERA
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setPhoto(result.assets[0].uri);
        setScreen('preview');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Camera error', 'Unable to open the camera.');
    }
  }

  // OPEN GALLERY
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setPhoto(result.assets[0].uri);
        setScreen('preview');
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Gallery error', 'Unable to open your gallery.');
    }
  }

  // RUN ACTUAL AI DISEASE PREDICTION
  async function detectDisease() {
    if (isPredicting) {
      return;
    }

    if (!photo) {
      Alert.alert('Photo missing', 'Please select a photo first.');
      return;
    }

    if (!modelSession) {
      Alert.alert(
        'AI model not ready',
        'Please wait for the AI model to load and try again.'
      );
      return;
    }

    setIsPredicting(true);

    try {
      // 1. Preprocess the selected leaf image.
      // 1. Check photo quality before AI analysis.
      const quality = await checkImageQuality(photo);

      if (!quality.valid) {
        Alert.alert('Photo quality problem', quality.message);
        return;
      }

      // 2. Preprocess the selected leaf image.
      const inputData = await preprocessLeafImage(photo);

      // 3. Create ONNX input tensor.
      const inputTensor = new ort.Tensor(
        'float32',
        inputData,
        [1, 3, 224, 224]
      );

      // 4. Run ONNX inference.
      const inputName = modelSession.inputNames[0];
      const outputName = modelSession.outputNames[0];

      const results = await modelSession.run({
        [inputName]: inputTensor,
      });

      // 5. Read model logits.
      const output = results[outputName];

      if (!output || !output.data) {
        throw new Error('The model returned an empty output.');
      }

      const logits = output.data;

      if (logits.length !== diseaseLabels.length) {
        throw new Error(
          `Model returned ${logits.length} values, but ${diseaseLabels.length} labels were provided.`
        );
      }

      // 6. Calculate Softmax probabilities.
      const maxLogit = Math.max(...logits);

      const expScores = Array.from(logits, value =>
        Math.exp(value - maxLogit)
      );

      const total = expScores.reduce(
        (sum, value) => sum + value,
        0
      );

      if (!Number.isFinite(total) || total <= 0) {
        throw new Error('Invalid prediction probabilities.');
      }

      const probabilities = expScores.map(
        value => value / total
      );

      // 7. Find the highest-confidence class.
      let bestIndex = 0;

      for (let i = 1; i < probabilities.length; i++) {
        if (probabilities[i] > probabilities[bestIndex]) {
          bestIndex = i;
        }
      }

      const predictedLabel = diseaseLabels[bestIndex];

      const confidence = Number(
        (probabilities[bestIndex] * 100).toFixed(2)
      );

      if (confidence <= 60) {
        setPredictedClass(null);
        setPredictionConfidence(null);

        Alert.alert(
          'Not Sure',
          `CropSaathi is not confident enough to identify this disease (${confidence}%). Please upload another clear leaf photo or consult an agriculture specialist for expert advice.`
        );

        return;
      }

      // 8. Check that the prediction belongs to the selected crop.
      const predictedCrop = predictedLabel.split('_')[0];

      if (
        !predictedCrop ||
        predictedCrop.toLowerCase() !== selectedCrop.toLowerCase()
      ) {
        Alert.alert(
          'Crop mismatch',
          `You selected ${selectedCrop}, but the model identified a ${predictedCrop} class. Please check the selected crop and photo, then try again.`
        );
        return;
      }

      // 9. Check that disease guidance exists.
      const guidance = diseaseGuidance[predictedLabel];

      if (!guidance) {
        throw new Error(
          `No disease guidance found for ${predictedLabel}.`
        );
      }

      // 10. Update prediction states.
      setPredictedClass(predictedLabel);
      setPredictionConfidence(confidence);

      // 11. Save the completed scan.
      const newScan = {
        id: Date.now().toString(),
        crop: selectedCrop,
        disease: guidance.name,
        predictedClass: predictedLabel,
        confidence: confidence,
        date: new Date().toLocaleDateString(),
      };

      setHistory(previous => [newScan, ...previous]);
      saveScanToBackend(newScan);

      // 12. Open result screen.
      setScreen('result');

      console.log('AI prediction:', predictedLabel);
      console.log('AI confidence:', confidence + '%');

    } catch (error) {
      console.error('CropSaathi prediction failed:', error);

      Alert.alert(
        'Prediction failed',
        error.message || 'Unable to analyse this leaf image.'
      );
    } finally {
      setIsPredicting(false);
    }
  }

  // START A NEW SCAN
  function startNewScan() {
    setPhoto(null);
    setSelectedCrop(null);
    setPredictedClass(null);
    setPredictionConfidence(null);
    setScreen('home');
  }

  // HEADER
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

  // MAIN BUTTON
  function PrimaryButton({ title, onPress, disabled = false }) {
    return (
      <Pressable
        style={[
          styles.button,
          disabled && styles.disabledButton,
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </Pressable>
    );
  }

  // SECONDARY BUTTON
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

  // BACK BUTTON
  function BackButton({ title = '← Back', onPress }) {
    return (
      <Pressable onPress={onPress} style={styles.backButton}>
        <Text style={styles.back}>{title}</Text>
      </Pressable>
    );
  }

  // FARMING TIP
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

            {isPredicting ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#347B43" />
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
            Your crop photo has been analysed.
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
              AI analysis result
            </Text>

            <View style={styles.statusBox}>
              <Text style={styles.statusTitle}>
                {currentDiseaseGuidance
                  ? 'AI analysis complete'
                  : 'Prediction unavailable'}
              </Text>

              <Text style={styles.statusText}>
                {currentDiseaseGuidance
                  ? 'The model has returned a prediction. Review the guidance below.'
                  : 'No valid prediction is currently available. Please try another photo.'}
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
                {currentDiseaseGuidance
                  ? currentDiseaseGuidance.name
                  : 'No disease prediction available.'}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                Confidence
              </Text>

              <Text style={styles.infoText}>
                {predictionConfidence !== null
                  ? `${predictionConfidence}%`
                  : 'Not available.'}
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
                {currentDiseaseGuidance
                  ? currentDiseaseGuidance.symptoms
                  : 'Symptoms will appear here after a valid AI prediction.'}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                Possible cause
              </Text>

              <Text style={styles.infoText}>
                {currentDiseaseGuidance
                  ? currentDiseaseGuidance.cause
                  : 'Disease cause information will appear after a valid AI prediction.'}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                Recommended action
              </Text>

              <Text style={styles.infoText}>
                {currentDiseaseGuidance
                  ? currentDiseaseGuidance.action
                  : 'Recommended action will appear after a valid AI prediction.'}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                Prevention
              </Text>

              <Text style={styles.infoText}>
                {currentDiseaseGuidance
                  ? currentDiseaseGuidance.prevention
                  : 'Prevention guidance will appear after a valid AI prediction.'}
              </Text>
            </View>

            <Text style={styles.disclaimer}>
              AI guidance is not a final diagnosis.
              Confirm with an agriculture expert before
              using any pesticide. A healthy prediction
              does not guarantee that a plant is disease-free.
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
                complete a photo analysis.
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

                {item.confidence !== undefined && (
                  <Text style={styles.historyConfidence}>
                    Confidence: {item.confidence}%
                  </Text>
                )}

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

// STYLES
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

  disabledButton: {
    opacity: 0.5,
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

  loadingBox: {
    alignItems: 'center',
    padding: 18,
  },

  loadingText: {
    color: '#347B43',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
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

  historyConfidence: {
    color: '#347B43',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  date: {
    color: '#8A968B',
    fontSize: 12,
  },
});
