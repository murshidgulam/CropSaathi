
import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StatusBar,
} from 'react-native';

export default function ResultScreen({
  photo,
  selectedCrop,
  setScreen,
  currentDiseaseGuidance,
  predictionConfidence,
  startNewScan,
  styles,
  Header,
  BackButton,
  PrimaryButton,
  SecondaryButton,
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.container}>
        <Header />

        <BackButton
          title="← Back to photo"
          onPress={() => setScreen('preview')}
        />

        <Text style={styles.heading}>Scan Result</Text>

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
            <Text style={styles.infoTitle}>Prediction</Text>
            <Text style={styles.infoText}>
              {currentDiseaseGuidance
                ? currentDiseaseGuidance.name
                : 'No disease prediction available.'}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Confidence</Text>
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
            <Text style={styles.infoTitle}>Symptoms</Text>
            <Text style={styles.infoText}>
              {currentDiseaseGuidance
                ? currentDiseaseGuidance.symptoms
                : 'Symptoms will appear here after a valid AI prediction.'}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Possible cause</Text>
            <Text style={styles.infoText}>
              {currentDiseaseGuidance
                ? currentDiseaseGuidance.cause
                : 'Disease cause information will appear after a valid AI prediction.'}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Recommended action</Text>
            <Text style={styles.infoText}>
              {currentDiseaseGuidance
                ? currentDiseaseGuidance.action
                : 'Recommended action will appear after a valid AI prediction.'}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Prevention</Text>
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
