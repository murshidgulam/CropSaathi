
import React, { useState } from 'react';

import {
  Alert,
} from 'react-native';

// SCREENS
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';

// STYLES
import styles from './styles/appStyles';

// REUSABLE COMPONENTS
import Header from './components/Header';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import BackButton from './components/BackButton';
import Tip from './components/Tip';

// CONSTANTS
import crops from './constants/crops';

// SERVICES
import {
  saveScanToBackend,
} from './services/apiService';

import {
  saveScanHistory,
} from './services/historyService';

import {
  predictDisease,
} from './services/aiService';

import {
  openCameraPicker,
  openGalleryPicker,
} from './services/imagePickerService';

// HOOKS
import useCropDiseaseModel from './hooks/useCropDiseaseModel';
import useScanHistory from './hooks/useScanHistory';

// DISEASE GUIDANCE
import diseaseGuidance from './diseaseGuidance';

export default function App() {
  // SCREEN STATE
  const [screen, setScreen] = useState('home');

  // CROP AND PHOTO STATE
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [photo, setPhoto] = useState(null);

  // AI STATE
  const {
    modelSession,
    modelLoading,
    modelError,
  } = useCropDiseaseModel();

  const [predictedClass, setPredictedClass] = useState(null);
  const [predictionConfidence, setPredictionConfidence] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // HISTORY STATE
  const {
    history,
    historyLoaded,
    setHistory,
    handleDeleteScan,
    handleClearHistory,
  } = useScanHistory();

  // CURRENT DISEASE GUIDANCE
  const currentDiseaseGuidance = predictedClass
    ? diseaseGuidance[predictedClass] || null
    : null;

  // SELECT CROP
  function continueToPhoto() {
    if (!selectedCrop) {
      Alert.alert(
        'Select a crop',
        'Please select your crop first.'
      );
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
      const imageUri = await openCameraPicker();

      if (imageUri) {
        setPhoto(imageUri);
        setScreen('preview');
      }
    } catch (error) {
      console.error('Camera error:', error);

      Alert.alert(
        'Camera error',
        error.message || 'Unable to open the camera.'
      );
    }
  }

  // OPEN GALLERY
  async function openGallery() {
    try {
      const imageUri = await openGalleryPicker();

      if (imageUri) {
        setPhoto(imageUri);
        setScreen('preview');
      }
    } catch (error) {
      console.error('Gallery error:', error);

      Alert.alert(
        'Gallery error',
        error.message || 'Unable to open your gallery.'
      );
    }
  }

  // DETECT DISEASE
  async function detectDisease() {
    if (isPredicting) return;

    if (!photo) {
      Alert.alert(
        'Photo missing',
        'Please select a photo first.'
      );
      return;
    }

    if (!modelSession) {
      Alert.alert(
        'AI model not ready',
        modelError || 'Please wait for the AI model to load.'
      );
      return;
    }

    setIsPredicting(true);

    try {
      const prediction = await predictDisease(
        photo,
        modelSession
      );

      if (!prediction.valid) {
        Alert.alert(
          'Photo quality problem',
          prediction.message
        );
        return;
      }

      const predictedLabel = prediction.predictedLabel;
      const confidence = prediction.confidence;

      // CONFIDENCE CHECK
      if (confidence <= 60) {
        setPredictedClass(null);
        setPredictionConfidence(null);

        Alert.alert(
          'Not Sure',
          `CropSaathi is not confident enough to identify this disease (${confidence}%). Please upload another clear leaf photo or consult an agriculture specialist for expert advice.`
        );

        return;
      }

      // CROP MATCH CHECK
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

      // DISEASE GUIDANCE
      const guidance = diseaseGuidance[predictedLabel];

      if (!guidance) {
        throw new Error(
          `No disease guidance found for ${predictedLabel}.`
        );
      }

      setPredictedClass(predictedLabel);
      setPredictionConfidence(confidence);

      // CREATE SCAN RECORD
      const newScan = {
        id: Date.now().toString(),
        crop: selectedCrop,
        disease: guidance.name,
        predictedClass: predictedLabel,
        confidence,
        date: new Date().toLocaleDateString(),
      };

      // SAVE TO BACKEND
      const backendScanId = await saveScanToBackend(newScan);

      const savedScan = {
        ...newScan,
        backendId: backendScanId,
      };

      // SAVE TO LOCAL HISTORY
      const updatedHistory = [
        savedScan,
        ...history,
      ];

      await saveScanHistory(updatedHistory);

      setHistory(updatedHistory);

      setScreen('result');

      console.log('AI prediction:', predictedLabel);
      console.log('AI confidence:', confidence + '%');

    } catch (error) {
      console.error(
        'CropSaathi prediction failed:',
        error
      );

      Alert.alert(
        'Prediction failed',
        error.message || 'Unable to analyse this leaf image.'
      );
    } finally {
      setIsPredicting(false);
    }
  }

  // START NEW SCAN
  function startNewScan() {
    setPhoto(null);
    setSelectedCrop(null);
    setPredictedClass(null);
    setPredictionConfidence(null);
    setScreen('home');
  }

  // REUSABLE COMPONENT WRAPPERS
  const HeaderComponent = () => (
    <Header styles={styles} />
  );

  const PrimaryButtonComponent = (props) => (
    <PrimaryButton {...props} styles={styles} />
  );

  const SecondaryButtonComponent = (props) => (
    <SecondaryButton {...props} styles={styles} />
  );

  const BackButtonComponent = (props) => (
    <BackButton {...props} styles={styles} />
  );

  const TipComponent = (props) => (
    <Tip {...props} styles={styles} />
  );

  // HOME SCREEN
  if (screen === 'home') {
    return (
      <HomeScreen
        crops={crops}
        selectedCrop={selectedCrop}
        setSelectedCrop={setSelectedCrop}
        continueToPhoto={continueToPhoto}
        setScreen={setScreen}
        styles={styles}
        Header={HeaderComponent}
        PrimaryButton={PrimaryButtonComponent}
        Tip={TipComponent}
      />
    );
  }

  // PHOTO AND PREVIEW SCREENS
  if (screen === 'photo' || screen === 'preview') {
    return (
      <ScanScreen
        screen={screen}
        selectedCrop={selectedCrop}
        photo={photo}
        setScreen={setScreen}
        openCamera={openCamera}
        openGallery={openGallery}
        isPredicting={isPredicting}
        detectDisease={detectDisease}
        modelSession={modelSession}
        styles={styles}
        Header={HeaderComponent}
        PrimaryButton={PrimaryButtonComponent}
        SecondaryButton={SecondaryButtonComponent}
        BackButton={BackButtonComponent}
        Tip={TipComponent}
      />
    );
  }

  // RESULT SCREEN
  if (screen === 'result') {
    return (
      <ResultScreen
        photo={photo}
        selectedCrop={selectedCrop}
        setScreen={setScreen}
        currentDiseaseGuidance={currentDiseaseGuidance}
        predictionConfidence={predictionConfidence}
        startNewScan={startNewScan}
        styles={styles}
        Header={HeaderComponent}
        BackButton={BackButtonComponent}
        PrimaryButton={PrimaryButtonComponent}
        SecondaryButton={SecondaryButtonComponent}
      />
    );
  }

  // HISTORY SCREEN
  if (screen === 'history') {
    return (
      <HistoryScreen
        setScreen={setScreen}
        historyLoaded={historyLoaded}
        history={history}
        startNewScan={startNewScan}
        onDeleteScan={handleDeleteScan}
        onClearHistory={handleClearHistory}
        styles={styles}
        Header={HeaderComponent}
        BackButton={BackButtonComponent}
        PrimaryButton={PrimaryButtonComponent}
      />
    );
  }

  return null;
}
